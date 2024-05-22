import type { Schema, Attribute } from '@strapi/strapi';

export interface RatingRating extends Schema.Component {
  collectionName: 'components_rating_ratings';
  info: {
    displayName: 'rating';
    icon: 'star';
  };
  attributes: {
    givenRating: Attribute.Integer & Attribute.Required;
    book: Attribute.Relation<'rating.rating', 'oneToOne', 'api::book.book'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'rating.rating': RatingRating;
    }
  }
}
