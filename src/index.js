'use strict';

/**
 * Strapi lifecycle hooks.
 *
 * bootstrap() runs a one-time data audit for offers to guarantee the invariants
 * our frontend OfferResolver relies on:
 *   1) Percent-discount offers targeted by category should use the
 *      "كمية من قسم" condition, not "كمية من منتج". Otherwise only products
 *      explicitly linked to the offer can trigger the discount, which is a
 *      common content-editor mistake.
 *   2) Every offer must carry stackingMode/stackingGroup/exclusiveScope so the
 *      resolver can enforce stacking rules deterministically. Legacy rows that
 *      were created before these fields existed get the defaults from schema.
 *
 * The audit is idempotent and only rewrites rows that actually need changes.
 *
 * Strapi v5 uses draft-and-publish: entityService.update touches drafts only,
 * so we use strapi.db.query to patch every row (draft AND published) directly
 * and re-save conditions via documentService when needed to keep component
 * relations in sync.
 */

function pickDefaultStackingGroup(firstRewardType) {
  switch (firstRewardType) {
    case 'منتج هدية':
    case 'كمية هدية':
      return 'gift';
    case 'سعر باقة':
      return 'bundle';
    case 'سعر ثابت لكمية':
      return 'pricing';
    case 'خصم نسبة':
      return 'pricing';
    default:
      return 'general';
  }
}

async function auditOffers(strapi) {
  const log = (msg) => strapi.log.info(`[offers-audit] ${msg}`);
  const warn = (msg) => strapi.log.warn(`[offers-audit] ${msg}`);

  let rows;
  try {
    rows = await strapi.db.query('api::offer.offer').findMany({
      populate: {
        categories: { select: ['id'] },
        products: { select: ['id'] },
        conditions: true,
        rewards: true,
      },
    });
  } catch (err) {
    warn(`could not read offers: ${err?.message || err}`);
    return;
  }

  let fixedConditions = 0;
  let filledStacking = 0;
  const documentsToRepublish = new Set();

  for (const row of rows || []) {
    const rewards = Array.isArray(row.rewards) ? row.rewards : [];
    const conditions = Array.isArray(row.conditions) ? row.conditions : [];
    const categories = Array.isArray(row.categories) ? row.categories : [];
    const firstReward = rewards[0] || null;
    const isPercentDiscount =
      firstReward?.rewardType === 'خصم نسبة' || row.offerType === 'خصم';

    const scalarUpdate = {};
    if (!row.stackingMode) {
      scalarUpdate.stackingMode = 'allow_stack';
      filledStacking += 1;
    }
    if (!row.stackingGroup) {
      scalarUpdate.stackingGroup = pickDefaultStackingGroup(firstReward?.rewardType);
      filledStacking += 1;
    }
    if (!row.exclusiveScope) {
      scalarUpdate.exclusiveScope = 'same_group';
    }

    if (Object.keys(scalarUpdate).length > 0) {
      try {
        await strapi.db.query('api::offer.offer').update({
          where: { id: row.id },
          data: scalarUpdate,
        });
      } catch (err) {
        warn(`offer#${row.id} scalar update failed: ${err?.message || err}`);
      }
    }

    const needsConditionFix =
      isPercentDiscount &&
      categories.length > 0 &&
      conditions.some((c) => c?.conditionType === 'كمية من منتج');

    if (needsConditionFix) {
      try {
        // Strip component ids so Strapi recreates them cleanly — passing old
        // ids triggers "components not related to entity" when the document
        // service is rewriting a versioned copy.
        const newConditions = conditions.map((c) => {
          const mapped = {
            __component: c?.__component || 'offer.shrt-alerd',
            conditionType:
              c?.conditionType === 'كمية من منتج' ? 'كمية من قسم' : c?.conditionType,
            minQuantity: c?.minQuantity ?? null,
            minCartAmount: c?.minCartAmount ?? null,
            note: c?.note ?? null,
          };
          return mapped;
        });
        await strapi.documents('api::offer.offer').update({
          documentId: row.documentId,
          data: { conditions: newConditions },
        });
        fixedConditions += 1;
        if (row.documentId) documentsToRepublish.add(row.documentId);
      } catch (err) {
        warn(`offer#${row.id} condition fix failed: ${err?.message || err}`);
      }
    }

    if (Object.keys(scalarUpdate).length > 0 && row.documentId) {
      documentsToRepublish.add(row.documentId);
    }
  }

  for (const documentId of documentsToRepublish) {
    try {
      await strapi.documents('api::offer.offer').publish({ documentId });
    } catch (err) {
      warn(`republish ${documentId} failed: ${err?.message || err}`);
    }
  }

  if (fixedConditions > 0 || filledStacking > 0) {
    log(
      `audit done: fixed ${fixedConditions} category-discount condition(s), backfilled ${filledStacking} stacking field(s), republished ${documentsToRepublish.size} document(s).`,
    );
  } else {
    log('audit done: no changes required.');
  }
}

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    try {
      await auditOffers(strapi);
    } catch (err) {
      strapi.log.error(`[offers-audit] unexpected: ${err?.message || err}`);
    }
  },
};
