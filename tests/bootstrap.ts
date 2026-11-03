import { Config } from '@japa/runner/types'
import '@japa/assert'
import '@japa/plugin-adonisjs'

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = () => {}
