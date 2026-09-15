async function main() {
  const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(3 * 1024 * 1024); // 3MB
  try {
    const res = await fetch('http://localhost:3000/api/services/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Potong Rambut Large',
        price: 40000,
        durationMinutes: 50,
        imageUrl: largeImage
      })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}

main();
