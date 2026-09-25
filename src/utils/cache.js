import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 60*60 }); // cache for 1 hour 

export default cache;