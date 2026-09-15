async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/services/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test',
        price: 0,
        durationMinutes: NaN
      })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}

main();
