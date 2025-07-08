const axios = require('axios')

async function analyzeNewsSources() {
  try {
    console.log('🔍 Analyzing news sources from API...\n')
    
    const response = await axios.get('http://localhost:3001/api/news/fast')
    const articles = response.data.articles
    
    console.log(`📊 Total articles: ${articles.length}`)
    
    // Count sources
    const sourceCount = {}
    articles.forEach(article => {
      const sourceName = article.source.name
      sourceCount[sourceName] = (sourceCount[sourceName] || 0) + 1
    })
    
    console.log('\n📰 Articles per source:')
    console.log('=====================')
    
    Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`${source}: ${count} articles`)
      })
    
    console.log(`\n🎯 Total unique sources: ${Object.keys(sourceCount).length}`)
    
  } catch (error) {
    console.error('❌ Error analyzing sources:', error.message)
  }
}

analyzeNewsSources() 