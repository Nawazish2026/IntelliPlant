import Entity from '../models/Entity.js';
import KnowledgeEdge from '../models/KnowledgeEdge.js';



export async function getFullGraph(filters = {}) {
  try {
    const entityQuery = {};
    if (filters.type) entityQuery.type = filters.type;
    if (filters.search) {
      entityQuery.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const entities = await Entity.find(entityQuery)
      .select('-embedding')
      .lean();

    const entityIds = entities.map(e => e._id);
    const edges = await KnowledgeEdge.find({
      $or: [
        { sourceEntityId: { $in: entityIds } },
        { targetEntityId: { $in: entityIds } }
      ]
    }).lean();

    const nodes = entities.map(entity => ({
      id: entity._id.toString(),
      name: entity.name,
      type: entity.type,
      subType: entity.subType,
      description: entity.description,
      attributes: entity.attributes,
      confidence: entity.confidence,
      documentCount: entity.documentIds?.length || 0,
      val: getNodeSize(entity.type),
      color: getNodeColor(entity.type)
    }));

    const links = edges
      .filter(edge =>
        entityIds.some(id => id.toString() === edge.sourceEntityId.toString()) &&
        entityIds.some(id => id.toString() === edge.targetEntityId.toString())
      )
      .map(edge => ({
        source: edge.sourceEntityId.toString(),
        target: edge.targetEntityId.toString(),
        relationship: edge.relationship,
        confidence: edge.confidence
      }));

    return { nodes, links };
  } catch (error) {
    console.error('Knowledge graph error:', error.message);
    return { nodes: [], links: [] };
  }
}

export async function getEntityDetails(entityId) {
  try {
    const entity = await Entity.findById(entityId)
      .select('-embedding')
      .populate('documentIds', 'originalName category')
      .lean();

    if (!entity) return null;

    const edges = await KnowledgeEdge.find({
      $or: [
        { sourceEntityId: entityId },
        { targetEntityId: entityId }
      ]
    }).lean();

    const connectedIds = edges.map(e =>
      e.sourceEntityId.toString() === entityId
        ? e.targetEntityId
        : e.sourceEntityId
    );

    const connectedEntities = await Entity.find({ _id: { $in: connectedIds } })
      .select('name type subType')
      .lean();

    return {
      ...entity,
      connections: edges.map(edge => {
        const connectedId = edge.sourceEntityId.toString() === entityId
          ? edge.targetEntityId.toString()
          : edge.sourceEntityId.toString();
        const connected = connectedEntities.find(e => e._id.toString() === connectedId);
        return {
          entity: connected,
          relationship: edge.relationship,
          confidence: edge.confidence,
          direction: edge.sourceEntityId.toString() === entityId ? 'outgoing' : 'incoming'
        };
      })
    };
  } catch (error) {
    console.error('Entity details error:', error.message);
    return null;
  }
}

export async function getGraphStats() {
  try {
    const [entityCount, edgeCount, typeCounts] = await Promise.all([
      Entity.countDocuments(),
      KnowledgeEdge.countDocuments(),
      Entity.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      totalEntities: entityCount,
      totalRelationships: edgeCount,
      entityTypes: typeCounts.reduce((acc, t) => {
        acc[t._id] = t.count;
        return acc;
      }, {}),
      density: entityCount > 1 ? (2 * edgeCount) / (entityCount * (entityCount - 1)) : 0
    };
  } catch (error) {
    console.error('Graph stats error:', error.message);
    return { totalEntities: 0, totalRelationships: 0, entityTypes: {}, density: 0 };
  }
}

export async function searchEntities(query, type = null, limit = 20) {
  try {
    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };
    if (type) filter.type = type;

    return await Entity.find(filter)
      .select('-embedding')
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Entity search error:', error.message);
    return [];
  }
}

function getNodeColor(type) {
  const colors = {
    equipment: '#3B82F6',
    instrument: '#8B5CF6',
    personnel: '#10B981',
    process: '#F59E0B',
    chemical: '#EF4444',
    regulation: '#EC4899',
    location: '#06B6D4',
    date: '#6B7280',
    parameter: '#F97316',
    document_ref: '#14B8A6'
  };
  return colors[type] || '#6B7280';
}

function getNodeSize(type) {
  const sizes = {
    equipment: 12,
    instrument: 8,
    personnel: 6,
    process: 10,
    chemical: 7,
    regulation: 9,
    location: 8,
    date: 4,
    parameter: 5,
    document_ref: 6
  };
  return sizes[type] || 6;
}

export default { getFullGraph, getEntityDetails, getGraphStats, searchEntities };
