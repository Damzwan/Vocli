import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';

// ✅ Preloaded (imported normally)
import HomePage from '../views/home.view.vue';
import LoginPage from '../views/login.view.vue';
import CreatePage from '../views/create.view.vue';
import PracticeLayoutPage from '../views/exercises/practice-layout.view.vue';
import PracticeMethodsPage from '../views/practiceMethods.view.vue';
import PracticeListPage from '../views/exercises/list.view.vue';
import PracticeFlashcardPage from '../views/exercises/flashcard.view.vue';
import PracticeTranslatePage from '../views/exercises/translation.view.vue';
import ReviewView from '../views/exercises/review.view.vue';
import PracticeMultipleChoicePage from '../views/exercises/multiple-choice.view.vue';


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage, // preloaded
    },
    {
        path: '/home',
        name: 'home',
        component: HomePage, // preloaded
    },
    {
        path: '/create',
        name: 'create',
        component: CreatePage,
    },
    {
        path: '/practice/:wordPackId',
        component: PracticeLayoutPage,
        children: [
            {path: '', name: 'methods', component: PracticeMethodsPage},
            {path: 'list', name: 'list', component: PracticeListPage},
            {path: 'flashcard', name: 'flashcard', component: PracticeFlashcardPage},
            {path: 'translation', name: 'translation', component: PracticeTranslatePage},
            {path: 'multiple-choice', name: 'multiple-choice', component: PracticeMultipleChoicePage},
        ],
        props: true,
    },
    {
        path: '/practice/:wordPackId/results',
        name: 'results',
        component: ReviewView,
        props: true,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
