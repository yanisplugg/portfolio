// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeSkillBars();
    addScrollAnimations();
    initializeThemeToggle();
});

// Анимация прогресс-баров навыков
function initializeSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    // Функция для анимации прогресс-баров
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const skillLevel = bar.getAttribute('data-skill');
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !bar.classList.contains('animated')) {
                setTimeout(() => {
                    bar.style.width = skillLevel + '%';
                    bar.classList.add('animated');
                }, Math.random() * 500); // Случайная задержка для эффекта
            }
        });
    }
    
    // Запуск анимации при скролле
    window.addEventListener('scroll', animateSkillBars);
    animateSkillBars(); // Запуск при загрузке
}

// Плавные анимации при скролле
function addScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    function animateOnScroll() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100;
            
            if (isVisible) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Изначально скрываем секции
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Запуск при загрузке
}

// Переключатель темы (светлая/темная)
function initializeThemeToggle() {
    // Создание кнопки переключения темы
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        box-shadow: var(--shadow-md);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(themeToggle);
    
    // Обработчик переключения темы
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        // Сохранение предпочтения темы
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Восстановление сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // CSS для темной темы
    const darkThemeStyles = document.createElement('style');
    darkThemeStyles.textContent = `
        .dark-theme {
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --text-light: #94a3b8;
            --bg-primary: #1e293b;
            --bg-secondary: #0f172a;
            --bg-card: #334155;
            --border-color: #475569;
        }
        
        .dark-theme .skill-progress {
            background: linear-gradient(90deg, #3b82f6, #06b6d4);
        }
        
        .theme-toggle:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(darkThemeStyles);
}

async function downloadPDF() {
    try {
        showNotification('Генерируем PDF...', 'info');

        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        const footer = document.querySelector('.actions-footer');
        const themeToggle = document.querySelector('.theme-toggle');
        const container = document.querySelector('.container');

        const isDarkTheme = document.body.classList.contains('dark-theme');

        // Скрыть ненужные элементы
        footer.style.display = 'none';
        if (themeToggle) themeToggle.style.display = 'none';

        // Устанавливаем ручные стили без разрушения layout
        const stylePatch = document.createElement('style');
        stylePatch.textContent = `
            .pdf-mode * {
                color: ${isDarkTheme ? '#f8fafc' : '#1e293b'} !important;
                background: none !important;
                box-shadow: none !important;
                text-shadow: none !important;
                border-color: transparent !important;
            }

            .pdf-mode {
                background-color: ${isDarkTheme ? '#1e293b' : '#ffffff'} !important;
                font-size: 14px !important;
                color: ${isDarkTheme ? '#f8fafc' : '#1e293b'} !important;
            }

            .pdf-mode .skill-progress {
                background-color: #3b82f6 !important;
            }

            .pdf-mode h1, .pdf-mode h2, .pdf-mode h3, .pdf-mode h4 {
                color: ${isDarkTheme ? '#f8fafc' : '#1e293b'} !important;
            }
        `;
        document.head.appendChild(stylePatch);
        container.classList.add('pdf-mode');

        await new Promise(resolve => setTimeout(resolve, 100)); // Пауза на применение стилей

        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: isDarkTheme ? '#1e293b' : '#ffffff',
            logging: false
        });

        // Удалить временные стили
        container.classList.remove('pdf-mode');
        document.head.removeChild(stylePatch);
        footer.style.display = 'flex';
        if (themeToggle) themeToggle.style.display = 'block';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210;
        const pageHeight = 295;
        const imgWidth = 200;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 5;

        pdf.setFillColor(...(isDarkTheme ? [30, 41, 59] : [255, 255, 255]));
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 5;
            pdf.addPage();
            pdf.setFillColor(...(isDarkTheme ? [30, 41, 59] : [255, 255, 255]));
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pageHeight;
        }

        const theme = isDarkTheme ? 'Dark' : 'Light';
        pdf.save(`Resume_${theme}.pdf`);
        showNotification('PDF успешно скачан!', 'success');
    } catch (error) {
        console.error('Ошибка при генерации PDF:', error);
        showNotification('Ошибка при создании PDF', 'error');
    }
}

// Функция печати резюме
function printResume() {
    // Скрываем кнопки действий перед печатью
    const footer = document.querySelector('.actions-footer');
    footer.style.display = 'none';
    
    window.print();
    
    // Возвращаем кнопки после печати
    setTimeout(() => {
        footer.style.display = 'flex';
    }, 1000);
    
    showNotification('Диалог печати открыт', 'info');
}

// Функция связи
function contactMe() {
    const email = 'ian.desiatskii@gmail.com';
    const subject = 'Вопрос по резюме';
    const body = 'Здравствуйте! Я заинтересован в вашем профиле...';
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    showNotification('Открывается почтовый клиент...', 'success');
}

// Система уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const styles = {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 2rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transition: 'all 0.3s ease',
        opacity: '0'
    };
    
    const colors = {
        info: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    Object.assign(notification.style, styles);
    notification.style.backgroundColor = colors[type];
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(10px)';
    }, 100);
    
    // Удаление уведомления
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Плавный скролл для якорных ссылок
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Эффект печатающегося текста для tagline
function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Запуск эффекта печатающегося текста при загрузке
window.addEventListener('load', function() {
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const originalText = tagline.textContent;
        typewriterEffect(tagline, originalText, 30);
    }
});

// Добавление интерактивности к контактным ссылкам
document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', function() {
        const text = this.querySelector('span').textContent;
        
        if (text.includes('@')) {
            // Email
            window.location.href = `mailto:${text}`;
        } else if (text.includes('+7') || text.includes('+8')) {
            // Телефон
            window.location.href = `tel:${text}`;
        } else if (text.includes('linkedin')) {
            // LinkedIn
            window.open(`https://${text}`, '_blank');
        } else if (text.includes('github')) {
            // GitHub
            window.open(`https://${text}`, '_blank');
        }
    });
});

// Добавление интерактивности к проектам
document.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', function() {
        const githubUrl = this.getAttribute('data-github');
        if (githubUrl) {
            window.open(githubUrl, '_blank');
            showNotification('Открывается GitHub репозиторий...', 'info');
        }
    });
    
    // Добавление эффекта при наведении
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Добавление курсора pointer для интерактивных элементов
const interactiveElements = document.querySelectorAll('.contact-item');
interactiveElements.forEach(element => {
    element.style.cursor = 'pointer';
});

// Lazy loading для изображений (если добавить больше изображений)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Инициализация lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);