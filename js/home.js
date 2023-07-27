const scroller = new Scroller(false) //스크롤 객체 생성

window.addEventListener('load', (event) => {
  //테마변경 (다크모드/일반모드)
  const mode = document.querySelector('.mode')
  const header = document.querySelector('header')
  const icons = mode.querySelectorAll('.fa-solid')

  mode.addEventListener('click',(event) => {
    document.body.classList.toggle('dark')
    header.classList.toggle('dark')

    for(const icon of icons){
      icon.classList.contains('active') ? 
        icon.classList.remove('active')
        : icon.classList.add('active')
    }
  })

  // 브라우저 상단으로 스크롤링 하기
  const arrowUp = document.querySelector('.footer .icons .scroll-up')
  arrowUp.addEventListener('click', (event) => {
    history.pushState({}, "", `#`) //url 주소 초기화
    scroller.setScrollPosition({ top : 0, behavior: 'smooth' })
  })

  const logo = document.querySelector('header .logo')
  logo.addEventListener('click', (event) => {
    event.preventDefault() // a태그의 기본적인 동작 제거
    history.pushState({}, "", `#`)
    scroller.setScrollPosition({ top:0, behavior: 'smooth'}) //a태그는 smooth가 작동하지않음(디폴트)
  })

  //blog content 애니메이션
  const sections = document.querySelectorAll('.blog-container > div:not(.follow)')
  const footer = document.querySelector('.footer')

  window.addEventListener('scroll',(event) => {
    sections.forEach(section => {
      // console.log(section, section.getBoundingClientRect().top, header.offsetHeight)

      if(section.getBoundingClientRect().top < header.offsetHeight + 200){
        const blogs = section.querySelectorAll('.blog')
        blogs.forEach(blog => blog.classList.add('show'))
      }

      //스크롤바가 브라우저 상단에 도달하면 애니메이션 해제
      if(scroller.getScrollPosition() < 10){
        const blogs = section.querySelectorAll('.blog')
        blogs.forEach(blog => blog.classList.remove('show'))
      }
    })

    //스크롤바를 헤더높이만큼 내린 경우 헤더 하단 그림자 & 푸터 숨기기
    if(scroller.getScrollPosition() > header.offsetHeight){
      header.classList.add('active')
      footer.classList.add('hide')
    }else{
      header.classList.remove('active')
      footer.classList.remove('hide')
    }
  })
})


//로드시 알림 띄우기
const noti = document.querySelector('.navbar > ul > li >a')
console.log(noti)
const notiMsg = document.createElement('div')
notiMsg.className = 'noti-msg'
notiMsg.innerText = `3개의 새로운 알림이 있습니다.`


function message(){
  setTimeout(()=>{
    document.body.append(notiMsg)
  },2000)
}
  setTimeout(()=>{
    notiMsg.style.display = 'none'
  },5000)
window.addEventListener('load', message)