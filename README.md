# 🍀 Moeum
Face Recognition 기반 네컷사진 바인딩 서비스, 모음  
2023.03.02 ~

[https://www.moeum.site](https://www.moeum.site)
<br/>   
<br/>

## 🍀 Server Architecture
<img src="https://img.shields.io/badge/TypeScript-2d79c7?style=flat-square&logo=TypeScript&logoColor=white"/> <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=Express&logoColor=white"/> <img src="https://img.shields.io/badge/MySQL-00758f?style=flat-square&logo=MySQL&logoColor=white"/> <img src="https://img.shields.io/badge/Sequelize-2379BD?style=flat-square&logo=Sequelize&logoColor=white"/> <img src="https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=AmazonAWS&logoColor=white"/> <img src="https://img.shields.io/badge/PM2-000000?style=flat-square&logo=PM2&logoColor=white"/>
    
<br/>   
<br/>

## 🍀 Contributors

| 정윤선 |
| :----------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/79686751?v=4" width="300"/> | 
| [yunsun99](https://github.com/yunsun99) |
| Moeum 팀장 / 서버 구축, MySQL DB 설계, REST API 작성, EC2 서버 배포, PM2 무중단 배포 등의 역할 수행 |
<br/>
<br/>
<br/>

## 🍀 Service Core Function
<br/>   
<br/>

## 🍀 Service Architecture
<img src="https://github.com/Moeum-ewha/Moeum-backend/blob/main/image/Service%20Architecture.png?raw=true" width="400"/>
<br/>    
<br/>

## 🍀 API Docs

### 🔗 [API Docs](https://held-nephew-fd8.notion.site/API-d037bbbbf32240dbadd451ee2f983c4a?pvs=4)    
<br/>    
<br/>

## 🍀 Database Schema
<details>
<summary>User</summary>
<div markdown="1">

```
export type UserAttribs = {
  id: number;
  email: string;
  username: string;
  password: string;
  salt: string;
  createdAt: string;
  posts?: Post[];
  friends?: Friend[];
};

export type UserCAttribs = Optional<UserAttribs, "id" | "createdAt">;

export type UserResponse = Pick<UserAttribs, "id" | "email" | "username">;

@Table({
  modelName: "User",
  tableName: "users",
  timestamps: true, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class User extends Model<UserAttribs, UserCAttribs> {
  @Unique("users.email")
  @AllowNull(false)
  @Column(DataType.STRING(256))
  email!: UserAttribs["email"];

  @Unique("users.username")
  @AllowNull(false)
  @Column(DataType.STRING(36))
  username!: UserAttribs["username"];

  @AllowNull(false)
  @Column(DataType.CHAR(128))
  password!: UserAttribs["password"];

  @AllowNull(false)
  @Column(DataType.CHAR(64))
  salt!: UserAttribs["salt"];

  @HasMany(() => Post, { foreignKey: "createdById" })
  posts: UserAttribs["posts"];

  @HasMany(() => Friend, { foreignKey: "createdById" })
  friends: UserAttribs["friends"];

  toResponse(): UserResponse {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
    };
  }
}
```
</div>
</details>

<details>
<summary>Post</summary>
<div markdown="1">

```
export type PostAttribs = {
  id: number;
  content: string;
  takenAt: Date;
  location: string;
  latitude: number;
  longitude: number;
  imgPath: string;
  createdAt: Date;
  createdBy?: User; // 모델에만 존재, 실제 데이터베이스 Column에는 없음.
  createdById: UserAttribs["id"];
  comments?: Comment[];
  friends?: Friend[];
};

type PostCAtrribs = Optional<PostAttribs, "id" | "createdAt">;

export type PostResponse = Pick<
  PostAttribs,
  | "id"
  | "content"
  | "takenAt"
  | "location"
  | "latitude"
  | "longitude"
  | "imgPath"
  | "createdAt"
> & {
  comments?: CommentResponse[];
  friends: FriendResponse[];
};

export type PostResponseSimple = Pick<
  PostAttribs,
  "id" | "location" | "latitude" | "longitude" | "imgPath"
>;

@Table({
  modelName: "Post",
  tableName: "posts",
  timestamps: true, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Post extends Model<PostAttribs, PostCAtrribs> {
  @AllowNull(false)
  @Column(DataType.STRING(255))
  content!: PostAttribs["content"]; // sequelize가 확실히 만들어 줄 것이기 때문에 !로 타입스크립트 에러를 없애야 함

  @AllowNull(false)
  @Column(DataType.STRING)
  takenAt!: PostAttribs["takenAt"];

  @AllowNull(false)
  @Column(DataType.STRING)
  location!: PostAttribs["location"];

  @AllowNull(false)
  @Column(DataType.FLOAT)
  latitude!: PostAttribs["latitude"];

  @AllowNull(false)
  @Column(DataType.FLOAT)
  longitude!: PostAttribs["longitude"];

  @AllowNull(false)
  @Column(DataType.STRING)
  imgPath!: PostAttribs["imgPath"];

  // @ForeignKey(() => User)
  // @Column(DataType.INTEGER)
  // createdById!: PostAttribs['createdById'];

  @BelongsTo(() => User, { foreignKey: "createdById" }) // 두 번째 인자는 외래 키 column의 이름
  createdBy: PostAttribs["createdBy"]; // post.createdBy를 사용할 일이 많아서 쓰는 것(JOIN하는 역할)

  @HasMany(() => Comment, { foreignKey: "postId" })
  comments: PostAttribs["comments"];

  @BelongsToMany(() => Friend, () => FriendPost)
  friends: PostAttribs["friends"];

  toResponse(): PostResponse {
    let comments = this.comments; // comments, [], undefined 3가지 경우의 수

    const friends = this.friends;
    if (!friends) throw new ServerError("POST__FRIEND_NOT_INCLUDED", 500);

    return {
      id: this.id,
      content: this.content,
      takenAt: this.takenAt,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude,
      imgPath: this.imgPath,
      createdAt: this.createdAt,
      comments: comments?.map((comment) => comment.toResponse()),
      friends: friends.map((friend) => friend.toResponse()),
    };
  }

  toResponseSimple(): PostResponseSimple {
    return {
      id: this.id,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude,
      imgPath: this.imgPath,
    };
  }
}
```
</div>
</details>

<details>
<summary>Friend</summary>
<div markdown="1">

```
export type FriendAttribs = {
  id: number;
  friendName: string;
  imgPath: string;
  createdBy?: User;
  createdById: UserAttribs["id"];
  posts?: Post[];
};

export type FriendCAttribs = Optional<FriendAttribs, "id">;

export type FriendResponse = Pick<
  FriendAttribs,
  "id" | "friendName" | "imgPath"
> & { posts: PostResponseSimple[] | undefined };

@Table({
  modelName: "Friend",
  tableName: "friends",
  timestamps: false, // createdAt, updatedAt 자동생성 X
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Friend extends Model<FriendAttribs, FriendCAttribs> {
  @Unique("user-friend")
  @AllowNull(false)
  @Column(DataType.STRING(255))
  friendName!: FriendAttribs["friendName"];

  @AllowNull(false)
  @Column(DataType.STRING)
  imgPath!: FriendAttribs["imgPath"];

  @Unique("user-friend")
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  createdById!: UserAttribs["id"];

  @BelongsTo(() => User, { foreignKey: "createdById" })
  createdBy: FriendAttribs["createdBy"];

  @BelongsToMany(() => Post, () => FriendPost)
  posts: FriendAttribs["posts"];

  toResponse(): FriendResponse {
    return {
      id: this.id,
      friendName: this.friendName,
      imgPath: this.imgPath,
      posts: this.posts?.map((post) => post.toResponseSimple()),
    };
  }
}

```
</div>
</details>

<details>
<summary>FriendPost</summary>
<div markdown="1">

```
export type FriendPostAttribs = {
  friendId: number;
  postId: number;
};

@Table({
  modelName: "FriendPost",
  tableName: "friendPosts",
  timestamps: false, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class FriendPost extends Model<FriendPostAttribs> {
  @ForeignKey(() => Friend)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  friendId!: FriendPostAttribs["friendId"];

  @ForeignKey(() => Post)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  postId!: FriendPostAttribs["postId"];
}
```
</div>
</details>

<details>
<summary>Comment</summary>
<div markdown="1">

```
export type CommentAttribs = {
  id: number;
  profile: number;
  content: string;
  createdAt: Date;
  createdBy?: User;
  createdById?: UserAttribs["id"];
  post?: Post;
  postId: PostAttribs["id"];
};

type CommentCAttribs = Optional<CommentAttribs, "id" | "createdAt">;

export type CommentResponse = Pick<
  CommentAttribs,
  "id" | "profile" | "content" | "createdAt" | "postId"
>;

@Table({
  modelName: "Comment",
  tableName: "comments",
  timestamps: true, // createdAt, updatedAt 자동생성
  charset: "utf8mb4",
  collate: "utf8mb4_general_ci",
})
export class Comment extends Model<CommentAttribs, CommentCAttribs> {
  @AllowNull(false)
  @Column(DataType.STRING(255))
  profile!: CommentAttribs["profile"];

  @AllowNull(false)
  @Column(DataType.STRING(255))
  content!: CommentAttribs["content"];

  @BelongsTo(() => User, { foreignKey: "createdById" })
  createdBy!: PostAttribs["createdBy"];

  @ForeignKey(() => Post)
  @Column(DataType.INTEGER)
  postId!: CommentAttribs["postId"];

  @BelongsTo(() => Post, { foreignKey: "postId" })
  post!: CommentAttribs["post"];

  toResponse(): CommentResponse {
    return {
      id: this.id,
      profile: this.profile,
      content: this.content,
      createdAt: this.createdAt,
      postId: this.postId,
    };
  }
}
```
</div>
</details>   

<br/>   
<br/>   


## 🍀 Code Covention

<details>
<summary>명명규칙(Naming Conventions)</summary>
<div markdown="1">
<br/>

1. 이름으로부터 의도가 읽혀질 수 있게 쓴다.
- ex)

    ```jsx
    // bad
    const account = () => {
      // 계정 관련해서 어떤 작업인지 알기 어려움
    }
    
    // good
    const viewMyAccount = () => {
      // 나의 계정 정보를 보는 함수라는 것을 알 수 있음
    }
    
    ```
    
2. 오브젝트, 함수, 그리고 인스턴스에는 `camelCase`를 사용한다.
- ex)
    
    ```jsx
    // bad
    const THISISMYOBJECT = {};
    const this_is_my_object = {};
    const thisismyfunction = () => {}
    
    // good
    const thisIsMyObject = {};
    const thisIsMyFunction = () => {}
    
    ```
    
3. 클래스나 constructor에는 `PascalCase`를 사용한다.
- ex)
    
    ```jsx
    // bad
    class user = {
      constructor(name) {
        this.name = name;
      }
    }
    
    const bad = new user({
      name: 'no...',
    });
    
    // good
    class User = {
      constructor(name) {
        this.name = name;
      }
    }
    
    const good = new User({
      name: 'yes!',
    });
    
    ```
    
4. 함수 이름은 동사 + 명사 형태로 작성한다.
ex) `createPost( )`

5. 약어 사용은 최대한 지양한다.

</div>
</details>


<details>
<summary>함수(Functions)</summary>
<div markdown="1">

1. 화살표 함수를 사용한다.
- ex)
    
    ```jsx
    const arr1 = [1, 2, 3];
    const bad = arr.map(function (x) {  // ES5 Not Good
      return x * x;
    });
    
    const arr2 = [1, 2, 3];
    const pow2 = arr.map(x => x * x);  // ES6 Good
    ```
    
</div>
</details>

<details>
<summary>조건식과 등가식(Comparison Operators & Equality)</summary>
<div markdown="1">
<br/>

1. `==` 이나 `!=` 보다 `===` 와 `!==` 을 사용한다.

2. 단축형을 사용한다.
- ex)
    
    ```jsx
    // bad
    if (name !== '') {
      // ...stuff...
    }
    
    // good
    if (name) {
      // ...stuff...
    }
    ```
    
3. 비동기 함수를 사용할 때 `Promise`함수의 사용은 지양하고 `async`, `await`를 쓰도록 한다
</div>
</details>

</br>
</br>   

## 🍀 Commit Convention

<aside>
👻 git commit message convention

ex) [Fix] viewMyAccount 실행 시 UNAUTHENTICATED 오류 뜨는 에러 수정

```ruby
- [Chore]: 단순 코드 수정, 내부 파일 수정
- [Feat] : 새로운 페이지 및 기능 구현
- [Add] : Feat 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성 시
- [Fix] : 버그, 오류 해결
- [Del] : 쓸모없는 코드 삭제
- [Docs] : README나 WIKI 등의 문서 개정
- [Move] : 프로젝트 내 파일이나 코드의 이동
- [Rename] : 파일 이름의 변경
- [Style] : 코드가 아닌 스타일 변경을 하는 경우
- [Init] : Initial commit을 하는 경우
```

</aside>
</br>   
</br>


## 🍀 Project Foldering
```
---📁src
------📄index.ts
------📁controllers
---------📄account.ts
---------📄auth.ts
---------📄aws.ts
---------📄comment.ts
---------📄database.ts
---------📄error.ts
---------📄friend.ts
---------📄friendLatest.ts
---------📄friends.ts
---------📄image.ts
---------📄latest.ts
---------📄post.ts
---------📄posts.ts
------📁middlewares
---------📁validators
------------📄account.ts
------------📄auth.ts
------------📄friends.ts
------------📄post.ts
------------📄posts.ts
---------📄auth.ts
---------📄file.ts
---------📄request.ts
------📁models
---------📄Comment.model.ts
---------📄Friend.model.ts
---------📄FriendPost.model.ts
---------📄Post.model.ts
---------📄User.model.ts
------📁services
---------📄auth.ts
---------📄database.ts
---------📄error.ts
---------📄s3.ts
------📁types
---------📄express.d.ts
```
</br>   
</br>

## 🍀 Dependencies Module ( package.json )
```
{
  "name": "moeum-backend",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.js",
  "scripts": {
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "dev": "nodemon --watch \"src/**/*.ts\" --exec \"ts-node\" src/index.ts"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Moeum-ewha/Moeum-backend.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/Moeum-ewha/Moeum-backend/issues"
  },
  "homepage": "https://github.com/Moeum-ewha/Moeum-backend#readme",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.449.0",
    "@types/cookie-parser": "^1.4.5",
    "@types/cors": "^2.8.16",
    "@types/multer-s3": "^3.0.3",
    "@types/on-finished": "^2.3.4",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jose": "^4.15.3",
    "morgan": "^1.10.0",
    "ms": "^2.1.3",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "mysql2": "^3.6.1",
    "on-finished": "^2.4.1",
    "reflect-metadata": "^0.1.13",
    "sequelize": "^6.33.0",
    "sequelize-typescript": "^2.1.5",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.18",
    "@types/morgan": "^1.9.5",
    "@types/ms": "^0.7.34",
    "@types/multer": "^1.4.10",
    "@types/node": "^20.8.3",
    "@types/uuid": "^9.0.7",
    "@types/validator": "^13.11.2",
    "nodemon": "^3.0.1",
    "prettier": "^3.0.3",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
```
<hr>
<br/>
