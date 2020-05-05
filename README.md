# Fn::Sub

スタック作成または更新するまで使用出来ない値を含むコマンドまたは出力を作成する

```YAML
Parameters:
  Env:
    Type: String

Resources:
  DataBucket:
    DeletionPolicy: Retain
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub data-${AWS::Region}-${Env}
```

us-east-1リージョン向けに作成すればバケット名はdata-us-east-1-developmentとなる

# Fn::Join

特定のリソースに対してのIAMポリシーを作成する場合に有効。特定のリソースがSAMテンプレートで作られる場合に、テンプレート作成時にどのリソースに対してのポリシーから特定出来ない。そんな場面で有効。


# Fn::ImportValue

別のスタックによってエクスポートされた出力の値を返す。

# 短縮記法は続けては使えない

NG

```YAML
AvailabilityZone: !Select [ 0, [ !GetAZs !Ref "AWS::Region" ] ]
```

OK

```YAML
AvailabilityZone: !Select
  - 0
  - !GetAZs
    Ref: "AWS::Region"
# または
AvailabilityZone: !Select
  - 0
  - Fn::GetAZs: !Ref "AWS::Region"
```

# lambdaで環境変数を使いたい

Environmentで設定出来る。配列を設定出来るか試したが失敗（出来るのかも…）

```YAML
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      Policies:
        - AmazonS3FullAccess
      Environment: 
        Variables:
          Key: 510
          MyName: "ken"
```

# new PromiseもPromise.allもawaitする

特にPromise.allの際にawait忘れ注意。忘れると非同期になった時点でlambdaが終了してしまう。

```js
  await Promise.all(processes).then(data => {
    callback(null,{
      statusCode: 200,
      body: JSON.stringify({message:"OK"})
    })
  })
```