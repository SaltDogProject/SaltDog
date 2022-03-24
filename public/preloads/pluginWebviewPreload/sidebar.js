//滚动条自动隐藏
var t1 = 0;
var t2 = 0;
var timer = null; // 定时器
document.body.classList.remove('hideScroll');
document.body.classList.add('showScroll');

// scroll监听
document.body.addEventListener('scroll',function() {
  clearTimeout(timer);
  console.log('sc')
  timer = setTimeout(isScrollEnd, 1000);
  t1 = document.documentElement.scrollTop || document.body.scrollTop;
  document.body.classList.remove('hideScroll');
document.body.classList.add('showScroll');
});

function isScrollEnd() {
  console.log('end')
  t2 = document.documentElement.scrollTop || document.body.scrollTop;
  // if(t2 == t1){
    document.body.classList.remove('showScroll');
document.body.classList.add('hideScroll');
  // }
}
console.log('inject scroll');