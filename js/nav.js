/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show submit form on click on "submit" */

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  $submitForm.slideToggle();
  // putMyStoriesOnPage();
}

$navSubmit.on("click", navSubmitClick);

/** Show favorites tab content hide allStoriesList */
function showFavorites(evt) {
  console.debug("showFavorites", evt);
  hidePageComponents();
  putFavoritesOnPage();
}

$navFavorites.on('click', showFavorites);

function showMyStories(evt) {
  console.debug('showMyStories', evt);
  hidePageComponents();
  //write this function
  putMyStoriesOnPage();
}

$navMyStories.on('click', showMyStories);