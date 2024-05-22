'use strict';

/**
 * read-list service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::read-list.read-list');
