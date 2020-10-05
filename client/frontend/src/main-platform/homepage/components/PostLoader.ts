export const intObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log('Entry:', entry);
    console.log('Intersecting:', entry.isIntersecting);
  });
});

const target = document.querySelector('#homepage_feed');
intObs.observe(target!);
