window.addEventListener('DOMContentLoaded', () => {
    let sviFilmovi = [];
    let kosarica = [];
  
    fetch('filmovi.csv')
      .then(res => res.text())
      .then(csv => {
        const rezultat = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true
        });
  
        sviFilmovi = rezultat.data.map(film => ({
          title: film.title,
          year: Number(film.year),
          genres: film.genres?.replace(/;/g, ', ') || '',
          duration: Number(film.duration),
          rating: parseFloat(film.rating),
          directors: film.directors?.split(';').map(d => d.trim()) || []
        }));
  
        prikaziTablicu(sviFilmovi.slice(0, 150));
      })
      .catch(error => {
        console.error("Greška prilikom učitavanja CSV-a:", error);
      });
  
    document.getElementById('rating-min').addEventListener('input', e => {
      document.getElementById('rating-value').textContent = e.target.value;
    });
  
    document.getElementById('filter-button').addEventListener('click', () => {
      const zanr = document.getElementById('genre-filter').value.toLowerCase();
      const godinaMin = parseInt(document.getElementById('year-min').value) || 0;
      const godinaMax = parseInt(document.getElementById('year-max').value) || 9999;
      const minRating = parseFloat(document.getElementById('rating-min').value) || 0;
  
      const filtrirani = sviFilmovi.filter(film => {
        const god = film.year;
        const ocjena = film.rating;
        const sadrziZanr = zanr === '' || film.genres.toLowerCase().includes(zanr);
  
        return sadrziZanr && god >= godinaMin && god <= godinaMax && ocjena >= minRating;
      });
  
      prikaziTablicu(filtrirani);
    });
  
    document.getElementById('confirm-rent').addEventListener('click', () => {
      alert('You have successfully rented the following movies:\n' + kosarica.map(film => film.title).join('\n'));
      kosarica = [];
      prikaziKosaricu();
    });
  
    function prikaziTablicu(filmovi) {
      const tbody = document.querySelector('#filmovi-tablica tbody');
      tbody.innerHTML = '';
  
      for (const film of filmovi) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${film.title}</td>
          <td>${film.year}</td>
          <td>${film.genres}</td>
          <td>${film.duration}</td>
          <td>${film.rating}</td>
          <td>${film.directors.join(', ')}</td>
          <td><button class="add-to-cart" data-title="${film.title}">Dodaj u košaricu</button></td>
        `;
        tbody.appendChild(row);
      }
  
      const addButtons = document.querySelectorAll('.add-to-cart');
      addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const filmTitle = e.target.getAttribute('data-title');
          const film = filmovi.find(f => f.title === filmTitle);
          if (film && !kosarica.includes(film)) {
            kosarica.push(film);
            prikaziKosaricu();
          }
        });
      });
    }
  
    function prikaziKosaricu() {
      const tbody = document.querySelector('#kosarica-tablica tbody');
      tbody.innerHTML = '';
  
      kosarica.forEach((film, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${film.title}</td>
          <td>${film.year}</td>
          <td>${film.genres}</td>
          <td><button class="remove-from-cart" data-index="${index}">Ukloni</button></td>
        `;
        tbody.appendChild(row);
      });
  
  
      const removeButtons = document.querySelectorAll('.remove-from-cart');
      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          kosarica.splice(index, 1);
          prikaziKosaricu();
        });
      });
  
      document.getElementById('confirm-rent').disabled = kosarica.length === 0;
    }
  });
  