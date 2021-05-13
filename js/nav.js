"use strict";

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

// handles the nav link for submitting a new story 
function navSubmitStory(){
  hidePageComponents();
  $submitStoryForm.show();
}

$navSubmitStory.on('click', navSubmitStory)

//handles nav link for favorite stories 
function navFavorites(){
  hidePageComponents();
  putFavoritesOnPage(currentUser);
  $favoriteStoryList.show(); 
}

$navFavorites.on('click', navFavorites)

//handles nav link for own stories 
function navOwnStories(){
  hidePageComponents();
  putOwnStoriesOnPage(currentUser);
  $ownStories.show();
}

$navOwnStories.on('click', navOwnStories)