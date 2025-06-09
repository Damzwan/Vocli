import { mount } from '@vue/test-utils'
import HomePage from '../../src/views/home.view.vue'
import { describe, expect, test } from 'vitest'

describe('home.view.vue', () => {
  test('renders home view', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.text()).toMatch('Inbox')
  })
})
