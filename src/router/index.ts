import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';
import HomePage from '../views/home.view.vue'
import LoginPage from '../views/login.view.vue'
import CreatePage from '../views/create.view.vue'
import practiceMethodsPage from '../views/practiceMethods.view.vue'
import practiceListPage from '../views/exercises/list.view.vue'
import practiceFlashcardPage from '../views/exercises/flashcard.view.vue'
import practiceTranslatePage from '../views/exercises/translation.view.vue'
import practiceResultPage from '../views/exercises/stats.view.vue'
import practiceMultipleChoicePage from '../views/exercises/multiple-choice.view.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/home',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/create',
        name: 'Create',
        component: CreatePage
    },
    {
        path: '/practice',
        name: 'Practice',
        component: practiceMethodsPage
    },
    {
        path: '/practice/list',
        name: 'PracticeList',
        component: practiceListPage
    },
    {
        path: '/practice/flashcard',
        name: 'PracticeFlashcard',
        component: practiceFlashcardPage
    },
    {
        path: '/practice/translation',
        name: 'PracticeTranslate',
        component: practiceTranslatePage
    },
    {
        path: '/practice/multiple-choice',
        name: 'PracticeMultipleChoice',
        component: practiceMultipleChoicePage
    },
    {
        path: '/practice/results',
        name: 'PracticeResults',
        component: practiceResultPage
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
