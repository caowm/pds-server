

// Thenable objects

const Builder = function (name) {
  this.name = name;
  console.log('call builder');
};

Builder.prototype.then = function(resolve, _reject){
  console.log('call then');
  resolve(this.name + '-' + this.name);
}

const b = new Builder('sql builder');

( async function () {
  const r = await b;
  console.log('result', r);
})();


async function f2() {
  const thenable = {
    then: function(resolve, _reject) {
      resolve('resolved!')
    }
  };
  console.log(await thenable); // resolved!
}

f2();
