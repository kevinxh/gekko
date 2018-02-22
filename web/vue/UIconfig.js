// This config is used in both the
// frontend as well as the web server.

// see https://github.com/askmike/gekko/blob/stable/docs/installing_gekko_on_a_server.md

const CONFIG = {
  headless: true,
  api: {
    host: '0.0.0.0',
    port: 80,
    timeout: 1200000 // 2 minutes
  },
  ui: {
    ssl: false,
    host: 'ec2-54-201-252-137.us-west-2.compute.amazonaws.com/',
    port: '',
    path: '/'
  },
  adapter: 'sqlite'
}

if(typeof window === 'undefined')
  module.exports = CONFIG;
else
  window.CONFIG = CONFIG;
