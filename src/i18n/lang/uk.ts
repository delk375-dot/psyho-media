import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Головна",
    posts: "Статті",
    tags: "Категорії",
    about: "Про медіа",
    archives: "Архів",
    search: "Пошук",
  },
  post: {
    publishedAt: "Опубліковано",
    updatedAt: "Оновлено",
    sharePostIntro: "Поділитися статтею:",
    sharePostOn: "Поділитися статтею на {{platform}}",
    sharePostViaEmail: "Поділитися статтею через email",
    tagLabel: "Теми",
    backToTop: "Повернутися нагору",
    goBack: "Назад",
    editPage: "Редагувати сторінку",
    previousPost: "Попередня стаття",
    nextPost: "Наступна стаття",
  },
  pagination: {
    prev: "Назад",
    next: "Далі",
    page: "Сторінка",
  },
  home: {
    socialLinks: "Соціальні посилання",
    featured: "Ключові матеріали",
    recentPosts: "Нові статті",
    allPosts: "Усі статті",
  },
  footer: {
    copyright: "Авторські права",
    allRightsReserved: "Усі права захищено.",
  },
  pages: {
    tagTitle: "Тема",
    tagDesc: "Усі матеріали за темою",

    tagsTitle: "Теми",
    tagsDesc: "Редакційна карта тем і категорій Тіньової карти.",

    postsTitle: "Статті",
    postsDesc:
      "Аналітичні матеріали про лідерство, психологію, переговори, маніпуляції, право і соціальні системи.",

    archivesTitle: "Архів",
    archivesDesc: "Хронологія опублікованих матеріалів.",

    searchTitle: "Пошук",
    searchDesc: "Пошук за матеріалами Тіньової карти.",
  },
  a11y: {
    skipToContent: "Перейти до контенту",
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    toggleTheme: "Перемкнути тему",
    searchPlaceholder: "Шукати статті...",
    noResults: "Нічого не знайдено",
    goToPreviousPage: "Перейти на попередню сторінку",
    goToNextPage: "Перейти на наступну сторінку",
  },
  notFound: {
    title: "404: сторінку не знайдено",
    message: "Сторінку не знайдено",
    goHome: "Повернутися на головну",
  },
} satisfies UIStrings;