import type { Schema, Struct } from '@strapi/strapi';

export interface OfferMkafatAlerd extends Struct.ComponentSchema {
  collectionName: 'components_offer_mkafat_alerd';
  info: {
    displayName: '\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0639\u0631\u0636';
  };
  attributes: {
    discountPercent: Schema.Attribute.Decimal;
    fixedPrice: Schema.Attribute.Decimal;
    giftQuantity: Schema.Attribute.Decimal;
    label: Schema.Attribute.Text;
    note: Schema.Attribute.Text;
    rewardType: Schema.Attribute.Enumeration<
      [
        '\u062E\u0635\u0645 \u0646\u0633\u0628\u0629',
        '\u0633\u0639\u0631 \u062B\u0627\u0628\u062A \u0644\u0643\u0645\u064A\u0629',
        '\u0645\u0646\u062A\u062C \u0647\u062F\u064A\u0629',
        '\u0643\u0645\u064A\u0629 \u0647\u062F\u064A\u0629',
        '\u0633\u0639\u0631 \u0628\u0627\u0642\u0629',
      ]
    >;
  };
}

export interface OfferShrtAlerd extends Struct.ComponentSchema {
  collectionName: 'components_offer_shrt_alerd';
  info: {
    displayName: '\u0634\u0631\u0637 \u0627\u0644\u0639\u0631\u0636';
  };
  attributes: {
    conditionType: Schema.Attribute.Enumeration<
      [
        '\u0643\u0645\u064A\u0629 \u0645\u0646 \u0645\u0646\u062A\u062C',
        '\u0643\u0645\u064A\u0629 \u0645\u0646 \u0642\u0633\u0645',
        '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0633\u0644\u0629',
      ]
    >;
    minCartAmount: Schema.Attribute.Decimal;
    minQuantity: Schema.Attribute.Decimal;
    note: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'offer.mkafat-alerd': OfferMkafatAlerd;
      'offer.shrt-alerd': OfferShrtAlerd;
    }
  }
}
