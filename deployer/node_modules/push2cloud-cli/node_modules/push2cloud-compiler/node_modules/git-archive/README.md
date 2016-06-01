# Git Archive

Module to take a bare git repo, archive it, and export it as a tarball to a given path

[![Build Status](https://travis-ci.org/nisaacson/git-archive.png?branch=master)](https://travis-ci.org/nisaacson/git-archive)

# Installation

```bash
npm install -S git-archive
```

# Usage

Say for example you have a repo named `apples` and you want to export the repo as a tarball named `apples.tar.gz` in the current directory. The export archive must reference a sha1 hash


## Promises

```javascript
var gitArchive = require('git-archive')

var data = {
  commit: 'c3f9bcb782bcfc0216cef5c7f68f6f86cd3bea8a',
  outputPath: path.join(__dirname, 'apples.tar.gz'),
  repoPath: '/path/to/bare/repo.git'
}

gitArchive(data)
  .then(function(outputPath) {
    console.log('git archived to tarball at path %s', reply)
  })
  .fail(function(err) {
    console.dir(err)
    throw error // or pass the error to a callback
  }).done()
})
```

## Callbacks

```javascript
var gitArchive = require('git-archive')

var data = {
  commit: 'c3f9bcb782bcfc0216cef5c7f68f6f86cd3bea8a',
  outputPath: path.join(__dirname, 'apples.tar.gz'),
  repoPath: '/path/to/bare/repo.git'
}

gitArchive(data, function(err, reply) {
  var error
  if (err) {
    return console.dir(err)
  }
  console.log('git archived to tarball at path %s', reply)
})
```


