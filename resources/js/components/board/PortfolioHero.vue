<template>
    <header class="hero" @pointerdown.stop>
        <img
            class="hero-photo"
            alt="Алиса Шевцова"
            width="180"
            height="180"
            src="/images/alice.webp"
            fetchpriority="high"
        />
        <h1 class="hero-name">Алиса Шевцова</h1>
        <p class="hero-role">UI/UX Designer</p>
        <p class="hero-text">
            3+ года в digital-дизайне.<br />
            Проектирую сайты для e-commerce<br />
            в команде с разработчиками.
        </p>
        <div class="cta-row flex flex-wrap">
            <a class="btn primary" href="https://t.me/leviaia" target="_blank" rel="noopener">
                <svg class="ico-plane" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M14.5 1.5 7 9M14.5 1.5 10 14.5 7 9 1.5 6l13-4.5Z"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linejoin="round"
                    />
                </svg>
                Связаться
            </a>
            <a
                class="btn ghost"
                href="https://drive.google.com/file/d/1jSSZB2j2gkP_9MXsS3hdPqPElesVWJeW/view?usp=sharing"
                target="_blank"
                rel="noopener"
            >
                <svg class="ico-eye" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <g>
                        <path
                            d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                            stroke="currentColor"
                            stroke-width="1.4"
                        />
                        <circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.4" />
                    </g>
                </svg>
                Смотреть CV
            </a>
        </div>
    </header>
</template>
