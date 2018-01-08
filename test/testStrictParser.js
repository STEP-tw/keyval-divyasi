const src=function(filePath){return "../src/"+filePath};
const errors=function(filePath){return "../src/errors/"+filePath};

const assert=require('chai').assert;
const StrictParser=require(src('index.js')).StrictParser;
const InvalidKeyError=require(errors('invalidKeyError.js'));

var invalidKeyErrorChecker=function(key,pos) {
  return function(err) {
    if(err instanceof InvalidKeyError && err.invalidKey==key && err.position==pos)
      return true;
    return false;
  }
};

describe("strict parser",function(){
  it("should only parse keys that are specified for a single key",function(){
    let kvParser=new StrictParser(["name"]);
    try {
      ()=>{kvParser.parse("age=23")}
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("age",5), e);
    }
  });

  it("should only parse keys that are specified for multiple keys",function(){
    let kvParser=new StrictParser(["name","age"]);
    let actual=kvParser.parse("name=john age=23");
    let expected={name:"john",age:"23"};
    assert.deepInclude(expected,actual);
    try {
      () => {
        var p=kvParser.parse("color=blue");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("color",9), e);
    }
  });

  it("should throw an error when one of the keys is not valid",function(){
    try {
      ()=>{
        let kvParser=new StrictParser(["name","age"]);
        kvParser.parse("name=john color=blue age=23");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("color",20), e);
    }
  });

  it("should throw an error on invalid key when there are spaces between keys and assignment operators",function(){
    try {
      () => {
        let kvParser=new StrictParser(["name","age"]);
        kvParser.parse("color   = blue");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("color",13), e);
    }
  });

  it("should throw an error on invalid key when there are quotes on values",function(){
    try {
      () => {
        let kvParser=new StrictParser(["name","age"]);
        kvParser.parse("color   = \"blue\"");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("color",15), e);
    }
  });

  it("should throw an error on invalid key when there are cases of both quotes and no quotes",function(){
    try {
      () => {
        let kvParser=new StrictParser(["name","age"]);
        kvParser.parse("name = john color   = \"light blue\"");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("color",33), e);
    }
  });

  it("should throw an error when no valid keys are specified",function(){
    try {
      () => {
        let kvParser=new StrictParser([]);
        kvParser.parse("name=john");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("name",8), e);
    }
  });

  it("should throw an error when no array is passed",function(){
    try {
      () => {
        let kvParser=new StrictParser();
        kvParser.parse("name=john");
      }
    } catch (e) {
      assert.isOk(invalidKeyErrorChecker("name",8), e);
    }
  });
})
