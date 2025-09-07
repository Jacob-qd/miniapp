async function testAPI() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
    
    console.log('\nTesting banners endpoint...');
    const bannersResponse = await fetch('http://localhost:3001/api/banners');
    const bannersData = await bannersResponse.json();
    console.log('Banners response:', bannersData);
    
    console.log('\nTesting solutions endpoint...');
    const solutionsResponse = await fetch('http://localhost:3001/api/solutions');
    const solutionsData = await solutionsResponse.json();
    console.log('Solutions response:', solutionsData);
    
    console.log('\nTesting products endpoint...');
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();
    console.log('Products response:', productsData);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();