import _ from 'lodash'

export function randomStringUnsafe (N) {
  let text = ''
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < N; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

export function trimZeroes (n) {
  if (_.includes(n.toString(), '.')) {
    return _.trimRight(_.trimRight(n.toString(), '0'), '.')
  } else {
    return n
  }
}
