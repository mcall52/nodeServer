function submit() {
  var form = document.getElementById("login");
  var username = form["Username"].value;
  var password = form["Password"].value;

  alert('username is ' + username + 'and pass is ' + password);
}
