async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/services/d81068d8-613a-4df5-9e06-687d1e24c01a', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Update UUID',
        price: 45000,
        durationMinutes: 55
      })
    });
    console.log(res.status);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

main();
