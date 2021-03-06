'use strict';

const _ = require('lodash');
const OGMNeoWhere = require('./ogmneo-where');
const OGMObjectParse = require('./ogmneo-parse');

/**
    * @class OGMNeoRelationQuery
 */
class OGMNeoRelationQuery {
    /**
        * Constructs a query object with a relation type.
        *
        * @constructor
        * @param {string} [type=null] - The relation name to filter.
    */
    constructor(type) {
        this.type = type;
    }

    set type(type) {
        if (_.isString(type) && !_.isEmpty(type)) {
            this._type = type;
        }
    }
    /**
     * Relation type name constraint.
     * @type {string}
    */
    get type() {
        return this._type;
    }

    /**
        * Convenience method that creates a query object with a relation type.
        *
        * @static
        * @param {string} [type=null] - The relation name to filter.
        * @returns {OGMNeoRelationQuery} Created query.
    */
    static create(type) {
        return new OGMNeoRelationQuery(type);
    }

    /**
        * Add ID and Label constraints to the startNode.
        *
        * @param {integer} nodeId - Node id constraint.
        * @param {string} label - Label constraint.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    startNode(nodeId, label) {
        if (_.isInteger(nodeId)) {
            this._startNodeId = nodeId;
        }
        if (_.isString(label)) {
            this._startNodeLabel = label;
        }
        return this;
    }

    /**
        * Add ID and Label constraints to the endNode.
        *
        * @param {integer} nodeId - Node id constraint.
        * @param {string} label - Label constraint.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    endNode(nodeId, label) {
        if (_.isInteger(nodeId)) {
            this._endNodeId = nodeId;
        }
        if (_.isString(label)) {
            this._endNodeLabel = label;
        }
        return this;
    }

    /**
        * Add startNode where constraint to this query object.
        *
        * @param {OGMNeoWhere} where - The query constraints that will be applied to startNode properties.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    startNodeWhere(where) {
        if (where == null || where instanceof OGMNeoWhere) {
            this._startNodeWhere = where;
            if (where) {
                this._startNodeWhere.variable = 'n1';
            }
        }
        return this;
    }
    /**
        * Add endNode where constraint to this query object.
        *
        * @param {OGMNeoWhere} where - The query constraints that will be applied to endNode properties.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    endNodeWhere(where) {
        if (where == null || where instanceof OGMNeoWhere) {
            this._endNodeWhere = where;
            if (where) {
                this._endNodeWhere.variable = 'n2';
            }
        }
        return this;
    }
    /**
        * Add relation where constraint to this query object.
        *
        * @param {OGMNeoWhere} where - The query constraints that will be applied to relation properties.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    relationWhere(where) {
        if (where == null || where instanceof OGMNeoWhere) {
            this._relationWhere = where;
            if (where) {
                this._relationWhere.variable = 'r';
            }
        }
        return this;
    }

    /**
        * Add limit constraint to this query object.
        *
        * @param {integer} value - The max number of values that should be returned.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    limit(limit) {
        if (_.isInteger(limit)) {
            this._limit = limit;
        }
        return this;
    }

    /**
    * Add DESCENDING order by clause to this query object.
    *
    * @param {string|array} properties - The properties in order to order by for.
    * @returns {OGMNeoRelationQuery} This instance of query.
    */
    descOrderBy(properties) {
        this._orderBy = {
            properties: properties,
            order: 'DESC'
        };
        return this;
    }

    /**
        * Add ASCENDING order by clause to this query object.
        *
        * @param {string|array} properties - The properties in order to order by for.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    ascOrderBy(properties, startNodeProperties = null, endNodeProperties = null) {
        this._orderBy = {
            properties: properties,
            startNodeProperties: startNodeProperties,
            endNodeProperties: endNodeProperties,
            order: 'ASC'
        };
        return this;
    }

    /**
        * Propreties that must be returned for the start node.
        *
        * @param {string|array} properties - The properties that can be a string if was just one or an array of string for many.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    returnStartNode(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._returnStart = OGMObjectParse.parsePropertiesArray(properties, 'n1');
        }
        return this;
    }

    /**
        * Propreties that must be returned for the end node.
        *
        * @param {string|array} properties - The properties that can be a string if was just one or an array of string for many.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    returnEndNode(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._returnEnd = OGMObjectParse.parsePropertiesArray(properties, 'n2');
        }
        return this;
    }
    /**
        * Propreties that must be returned for the relation node.
        *
        * @param {string|array} properties - The properties that can be a string if was just one or an array of string for many.
        * @returns {OGMNeoRelationQuery} This instance of query.
    */
    returnRelationNode(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._returnRelation = OGMObjectParse.parsePropertiesArray(properties, 'r');
        }
        return this;
    }

    /**
        * Builde cypher match cypher clause.
        *
        * @returns {string} This return an match cypher based on this query.
    */
    matchCypher() {
        return `MATCH p=(${this._startNodeClause()})-[${this._relationClause()}]->(${this._endNodeClause()}) ${this.whereCypher()}`;
    }
    /**
        * Build cypher where cypher clause.
        *
        * @returns {string} This return an match cypher based on this query.
    */
    whereCypher() {
        let where = '';
        if (this._startNodeId != null) {
            where = this._concatWhereClause(where, `ID(n1) = ${this._startNodeId}`);
        }
        if (this._endNodeId != null) {
            where = this._concatWhereClause(where, `ID(n2) = ${this._endNodeId}`);
        }
        if (this._relationWhere != null) {
            where = this._concatWhereClause(where, this._relationWhere.clause);
        }
        if (this._startNodeWhere != null) {
            where = this._concatWhereClause(where, this._startNodeWhere.clause);
        }
        if (this._endNodeWhere != null) {
            where = this._concatWhereClause(where, this._endNodeWhere.clause);
        }
        return (where !== '') ? `WHERE ${where}` : '';
    }

    _concatWhereClause(whereClause, newClause) {
        return whereClause + ((whereClause !== '') ? ' AND ' : '') + newClause;
    }

    _startNodeClause() {
        return 'n1' + ((this._startNodeLabel != null) ? `:${this._startNodeLabel}` : '');
    }
    _endNodeClause() {
        return 'n2' + ((this._endNodeLabel != null) ? `:${this._endNodeLabel}` : '');
    }
    _relationClause() {
        return 'r' + ((this.type != null) ? `:${this.type}` : '');
    }

    returnClause(populated = false) {
        let returnClause = (this._returnRelation) ? this._returnRelation : 'r';
        if (populated) {
            returnClause += ', ' + ((this._returnStart) ? this._returnStart : 'n1');
            returnClause += ', ' + ((this._returnEnd) ? this._returnEnd : 'n2');
        }
        return `RETURN ${returnClause}`;
    }

    nodesReturnClause(nodes, distinct) {
        let returnClause = '';
        let distinctClause = (distinct) ? 'DISTINCT ' : '';
        if (!nodes || nodes === 'start' || nodes === 'both') {
            returnClause += ((this._returnStart) ? this._returnStart : 'n1');
        }
        if (!nodes || nodes === 'end' || nodes === 'both') {
            if (returnClause !== '') {
                returnClause += ', ';
            }
            returnClause += ((this._returnEnd) ? this._returnEnd : 'n2');
        }
        return `RETURN ${distinctClause}${returnClause}`;
    }

    orderByClause() {
        let orderBy = '';
        if (this._orderBy) {
            orderBy = this._addOrderByClause(orderBy, this._orderBy.properties, 'r');
            orderBy = this._addOrderByClause(orderBy, this._orderBy.startNodeProperties, 'n1');
            orderBy = this._addOrderByClause(orderBy, this._orderBy.endNodeProperties, 'n2');
            return (orderBy !== '') ? `ORDER BY ${orderBy} ${this._orderBy.order}` : '';
        }
        return '';
    }

    _addOrderByClause(clause, properties, variable) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            let propertiesClause = OGMObjectParse.parsePropertiesArray(properties, variable);
            return clause + ((clause !== '') ? ', ' : '') + `${propertiesClause}`;
        }
        return clause;
    }

    limitClause() {
        return (this._limit) ? `LIMIT ${this._limit}` : '';
    }

    queryCypher() {
        return this._queryCypherBuilder(false);
    }

    queryPopulatedCypher() {
        return this._queryCypherBuilder(true);
    }

    queryNodesCypher(nodes = 'both', distinct = false) {
        let query = `${this.matchCypher()} ${this.nodesReturnClause(nodes, distinct)}`;
        let orderBy = this.orderByClause();
        let limit = this.limitClause();
        if (orderBy !== '') {
            query += ` ${orderBy}`;
        }
        if (limit !== '') {
            query += ` ${limit}`;
        }
        return query;
    }

    countCypher() {
        return `${this.matchCypher()} RETURN COUNT(r) as count`;
    }

    _queryCypherBuilder(populated = false) {
        let query = `${this.matchCypher()} ${this.returnClause(populated)}`;
        let orderBy = this.orderByClause();
        let limit = this.limitClause();
        if (orderBy !== '') {
            query += ` ${orderBy}`;
        }
        if (limit !== '') {
            query += ` ${limit}`;
        }
        return query;
    }
}

module.exports = OGMNeoRelationQuery;