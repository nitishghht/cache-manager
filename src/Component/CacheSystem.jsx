import React, { useState, useEffect } from 'react';

const CacheSystem = () => {
  const [cacheLevels, setCacheLevels] = useState([]);
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    console.log('Cache Levels updated:', cacheLevels);
  }, [cacheLevels]);

  // Add a new cache level with the specified size and eviction policy (LRU or LFU)
  const addCacheLevel = (size, evictionPolicy) => {
    setCacheLevels([...cacheLevels, { size, evictionPolicy, cache: {}, accessCount: {}, accessOrder: [] }]);
  };

  // Get data from the cache corresponding to the key
  const get = (key) => {
    for (let i = 0; i < cacheLevels.length; i++) {
      const level = cacheLevels[i];
      if (level.cache[key]) {
        updateAccessData(key, i, level.evictionPolicy); // Update access information for LRU or LFU
        console.log(`Data found at level ${i + 1}: ${level.cache[key]}`);
        return level.cache[key];
      }
    }
    console.log('Data not found');
    return null;
  };

  // Insert a key-value pair into the L1 cache
  const put = (key, value) => {
    if (cacheLevels.length === 0) return;

    const L1 = cacheLevels[0];

    if (Object.keys(L1.cache).length >= L1.size) {
      evict(L1, L1.evictionPolicy);
    }

    L1.cache[key] = value;
    L1.accessOrder.push(key);
    L1.accessCount[key] = (L1.accessCount[key] || 0) + 1;

    setCacheLevels([...cacheLevels]);
  };

  // Eviction based on policy
  const evict = (level, evictionPolicy) => {
    let keyToEvict = null;

    if (evictionPolicy === 'LRU') {
      keyToEvict = level.accessOrder.shift();
    } else if (evictionPolicy === 'LFU') {
      let minAccessCount = Infinity;
      Object.keys(level.cache).forEach((key) => {
        if (level.accessCount[key] < minAccessCount) {
          minAccessCount = level.accessCount[key];
          keyToEvict = key;
        }
      });
    }

    if (keyToEvict) {
      delete level.cache[keyToEvict];
      delete level.accessCount[keyToEvict];
      console.log(`Evicted key: ${keyToEvict}`);
    }
  };

  // Update access data for LRU or LFU
  const updateAccessData = (key, levelIndex, evictionPolicy) => {
    const level = cacheLevels[levelIndex];

    if (evictionPolicy === 'LRU') {
      level.accessOrder = level.accessOrder.filter((k) => k !== key);
      level.accessOrder.push(key);
    }

    level.accessCount[key] = (level.accessCount[key] || 0) + 1;

    setCacheLevels([...cacheLevels]);
  };

  // Remove cache level by index
  const removeCacheLevel = (index) => {
    const newLevels = [...cacheLevels];
    newLevels.splice(index, 1);
    setCacheLevels(newLevels);
  };

  // Display current state of the cache
  const displayCache = () => {
    console.log('Cache Levels:');
    cacheLevels.forEach((level, index) => {
      console.log(`Level ${index + 1} (${level.evictionPolicy}):`, level.cache);
    });
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Dynamic Multilevel Cache System</h1>

      <div className="mb-4">
        <input
          type="text"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter key"
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter value"
          className="p-2 border rounded mr-2"
        />
        <button
          onClick={() => put(inputKey, inputValue)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Insert Data
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={() => addCacheLevel(3, 'LRU')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add LRU Cache Level
        </button>
        <button
          onClick={() => addCacheLevel(3, 'LFU')}
          className="bg-green-500 text-white px-4 py-2 ml-2 rounded"
        >
          Add LFU Cache Level
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cacheLevels.map((level, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h2 className="font-bold mb-2">Cache Level {index + 1} ({level.evictionPolicy})</h2>
            <ul>
              {Object.entries(level.cache).map(([key, value]) => (
                <li key={key}>
                  <span className="font-bold">{key}</span>: {value}
                </li>
              ))}
            </ul>
            <button
              onClick={() => removeCacheLevel(index)}
              className="bg-red-500 text-white px-2 py-1 mt-2 rounded"
            >
              Remove Level
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          type="text"
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter key to fetch"
          className="p-2 border rounded mr-2"
        />
        <button
          onClick={() => {
            const data = get(inputKey);
            alert(`Data: ${data || 'Not found'}`);
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Fetch Data
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={displayCache}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Display Cache in Console
        </button>
      </div>
    </div>
  );
};

export default CacheSystem;
