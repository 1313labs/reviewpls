# reviewpls
Securely send git diffs for teammates to comment

## Installation
```
yarn global add reviewpls
```

## Development
- Remove your installed version of `reviewpls`.
  ```
  yarn global remove reviewpls
  ```
- Being inside the folder of this project, symlink the package.
  ```
  yarn link
  ```
- Done, now you can run `reviewpls` and it will run the stuff inside this folder.
You can easily change the code and run `reviewpls` again to see the changes.
