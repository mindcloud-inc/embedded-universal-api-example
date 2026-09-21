// A manifest, not code: every snippet lives as a real file under examples/,
// so what the page renders is exactly what someone browsing the repo copies.
// The `next` stack is the running app's own files (see app/code/page.jsx).

export const BACKEND_STACKS = [
  { value: 'next', label: 'Next.js (this repo)' },
  { value: 'node', label: 'Node.js / Express' },
  { value: 'python', label: 'Python / FastAPI' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby / Rails' },
  { value: 'php', label: 'PHP / Laravel' },
  { value: 'curl', label: 'curl' }
];

export const FRONTEND_STACKS = [
  { value: 'next', label: 'Next.js (this repo)' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'vanilla', label: 'Plain JavaScript' }
];

const IDENTIFY = {
  node: { file: 'examples/node/identify-the-customer.js', caption: 'Express: create the end user once, mint a token per session.' },
  python: { file: 'examples/python/identify_the_customer.py', caption: 'FastAPI: create the end user once, mint a token per session.' },
  go: { file: 'examples/go/identify_the_customer.go', caption: 'Go: create the end user once, mint a token per session.' },
  ruby: { file: 'examples/ruby/identify_the_customer.rb', caption: 'Rails: create the end user once, mint a token per session.' },
  php: { file: 'examples/php/IdentifyTheCustomer.php', caption: 'Laravel: create the end user once, mint a token per session.' },
  curl: { file: 'examples/curl/identify-the-customer.sh', caption: 'The two raw calls your backend makes.' }
};

const CONNECT = {
  react: { file: 'examples/react/useMindCloud.js', caption: "React: load the SDK with your backend's token, then open the dialog." },
  vue: { file: 'examples/vue/useMindCloud.js', caption: 'Vue: the same flow with the composition API.' },
  vanilla: { file: 'examples/vanilla/integrations.html', caption: 'No framework: a script tag and a few lines.' }
};

const USE_CONNECTION = {
  node: { file: 'examples/node/use-the-connection.js', caption: 'Express: one read and one write against the connection.' },
  python: { file: 'examples/python/use_the_connection.py', caption: 'FastAPI: one read and one write against the connection.' },
  go: { file: 'examples/go/use_the_connection.go', caption: 'Go: one helper, any app and action.' },
  ruby: { file: 'examples/ruby/use_the_connection.rb', caption: 'Rails: one helper, any app and action.' },
  php: { file: 'examples/php/UseTheConnection.php', caption: 'Laravel: one helper, any app and action.' },
  curl: { file: 'examples/curl/use-the-connection.sh', caption: 'The same call shape for every app and action.' }
};

export const STACK_EXAMPLES = {
  1: IDENTIFY,
  2: CONNECT,
  3: USE_CONNECTION
};
