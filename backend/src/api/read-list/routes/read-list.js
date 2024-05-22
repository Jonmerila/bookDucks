'use strict';

/**
 * read-list router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::read-list.read-list');
