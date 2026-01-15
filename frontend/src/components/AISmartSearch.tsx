import { useState } from 'react';

interface SearchResult {
  _id: string;
  title: string;
  name: string;
  description: string;
  landNumber: string;
  khataNumber: string;
  address: string;
  status: string;
  relevanceScore: number;
  matchedFields: string[];
  createdAt: string;
}

export default function AISmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [suggestions] = useState([
    'Boundary dispute near Whitefield',
    'Family partition pending',
    'Land number 123',
    'Khata disputes',
    'Recent cases'
  ]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/ai/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: q })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const highlightMatch = (text: string, field: string, matchedFields: string[]) => {
    if (!text || !matchedFields.includes(field)) return text;
    
    const queryWords = query.toLowerCase().split(/\s+/);
    let result = text;
    queryWords.forEach(word => {
      if (word.length > 2) {
        const regex = new RegExp(`(${word})`, 'gi');
        result = result.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
      }
    });
    return result;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'in progress': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            🔍
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Smart Search</h2>
            <p className="text-white/80">Search disputes using natural language</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, location, land number, description..."
            className="w-full px-6 py-4 rounded-xl text-gray-800 placeholder-gray-400 bg-white shadow-lg text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium"
          >
            {loading ? '⏳' : '🔍'} Search
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-white/60 text-sm">Try:</span>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">Search Results</h3>
              <p className="text-sm text-gray-500">
                Found {results.length} matching dispute{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            {results.length > 0 && (
              <div className="text-xs text-gray-500">
                Sorted by relevance score
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching with AI...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium">No matching disputes found</p>
              <p className="text-sm mt-2">Try different keywords or check spelling</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((result, idx) => (
                <div key={result._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-indigo-600">#{idx + 1}</span>
                        <h4 
                          className="font-bold text-gray-800"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightMatch(result.title, 'title', result.matchedFields) 
                          }}
                        />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        {result.name && (
                          <p className="text-gray-600">
                            <span className="font-medium">Name:</span>{' '}
                            <span dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.name, 'name', result.matchedFields) 
                            }} />
                          </p>
                        )}
                        {result.description && (
                          <p className="text-gray-600 line-clamp-2">
                            <span className="font-medium">Description:</span>{' '}
                            <span dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.description, 'description', result.matchedFields) 
                            }} />
                          </p>
                        )}
                        {result.address && (
                          <p className="text-gray-600">
                            <span className="font-medium">Address:</span>{' '}
                            <span dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.address, 'address', result.matchedFields) 
                            }} />
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.landNumber && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            Land #: <span dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.landNumber, 'landNumber', result.matchedFields) 
                            }} />
                          </span>
                        )}
                        {result.khataNumber && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                            Khata #: <span dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.khataNumber, 'khataNumber', result.matchedFields) 
                            }} />
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          📅 {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Matched Fields */}
                      {result.matchedFields.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <span>✨ Matched in:</span>
                          {result.matchedFields.map((field, i) => (
                            <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded capitalize">
                              {field}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Relevance Score */}
                    <div className="ml-4 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex flex-col items-center justify-center">
                        <div className="text-xl font-bold text-indigo-600">{result.relevanceScore}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searched && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
          <h3 className="font-bold text-gray-800 mb-3">💡 Smart Search Tips</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-lg mb-2">🔤 Natural Language</div>
              <p className="text-sm text-gray-600">
                Search using everyday language like "boundary disputes in Bangalore"
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-lg mb-2">🔢 By Numbers</div>
              <p className="text-sm text-gray-600">
                Search by land number, khata number, or survey number
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-lg mb-2">👤 By Name</div>
              <p className="text-sm text-gray-600">
                Find disputes by applicant name or address
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-lg mb-2">📝 By Description</div>
              <p className="text-sm text-gray-600">
                Search for keywords mentioned in dispute descriptions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
