"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

//functionality for adding hearts for favoriting and updating them so they reflect users favorites 
function addHeart(story){
  //if user is logged in and story is a favorite
  if(currentUser && currentUser.isFavorite(story)) return '<span><i class="fas fa-heart"></i></span>';
  //if user is logged in and story is not a favorite 
  else if (currentUser && !currentUser.isFavorite(story)) return '<span><i class="far fa-heart"></i></span>';
  //if user is not logged in 
  else return ''
}
//function for adding a trash can next to users stories, so that they can be deleted 
function addTrashCan(story){
  if(currentUser && currentUser.isUserStory(story)) return '<span><i class="fas fa-trash-alt"></i></span>';
  else return ''
}


//values for parameters onStoryPage and onOwnStories are boolean values
function generateStoryMarkup(story, onStoryPage, onOwnStories) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${onStoryPage ? addHeart(story) : ''}
      ${onOwnStories ? addTrashCan(story) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>${onStoryPage ? addTrashCan(story) : ''}
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    //since we are generating markup for storyPage; onStoryPage = true, onOwnStories = false 
    //this will ensure a heart is posted before the link, and trash can after 
    const $story = generateStoryMarkup(story, true, false);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

//handles UI functionality for submitting a new story 
function updateUIOnSubmitNewStory(){
  $submitStoryForm.hide()
  $allStoriesList.show(); 
}
//function for adding new story to page 
async function addNewStoryOnPage(evt){
  evt.preventDefault();
  //get input value 
  const title = $('#story-title').val();
  const author = $('#story-author').val();
  const url = $('#story-url'). val();
  //updates storyList with new story you want to submit
  await storyList.addStory(currentUser, {title, author, url});
  //callbacks for updating DOM with new story
  putStoriesOnPage();
  updateUIOnSubmitNewStory();
  $submitStoryForm.trigger('reset');
}
$submitStoryForm.on('submit', addNewStoryOnPage);


//functions for add/removing favorites and updating DOM
//handles UI functionality for favorites list 
function putFavoritesOnPage(user){
  $favoriteStoryList.empty();
  if(user.favorites.length === 0){
    const $noFavoritesDisplay = $('<p class="no-display">You currently have no favorites</p>');
    $favoriteStoryList.append($noFavoritesDisplay)
  } else {
    user.favorites.forEach(story => {
      const $story = generateStoryMarkup(story, false, false);
      $favoriteStoryList.append($story)
    })
  }
}

//gets story data from DOM and return a story instance to add/remove
async function getStoryData(evt){
    //get storyId of list element 
    const $storyId = $(evt.target).closest('li').attr('id');
    //use storyID to get story Data 
    const response =  await axios({
      url: `${BASE_URL}/stories/${$storyId}`,
      method: "GET",
    });
    //return new story instance to pass into callback that adds or removes favorites
    return new Story(response.data.story);
}


/// event handler function 
async function addOrRemoveFavorites(evt){
  //get story current fav/unfav state and toggle class to change when you click 
  const $selectedItem = $(evt.target);
  $selectedItem.toggleClass('fas far');
  //create a story instance of li being favorites/unfavorited
  const story = await getStoryData(evt);
  //add or remove favorite based on current class 
  $selectedItem.hasClass('fas') ? currentUser.addFavorite(story) : currentUser.removeFavorite(story);
}

$($allStoriesList).on("click", '.fa-heart' , addOrRemoveFavorites)

//function for removing from story page 

async function removeStoryfromStoryPage(evt){
  const $storyId = $(evt.target).closest('li').attr('id');
  await storyList.removeStory(currentUser, $storyId);
  putStoriesOnPage();
}
//function for removing from own story page 
async function removeStoryfromOwnStoryPage(evt){
  const $storyId = $(evt.target).closest('li').attr('id');
  await storyList.removeStory(currentUser, $storyId);
  putOwnStoriesOnPage(currentUser);
}
//event listener on main story page 
$($allStoriesList).on("click", '.fa-trash-alt', removeStoryfromStoryPage);
//event listener on own story page
$($ownStories).on("click", '.fa-trash-alt', removeStoryfromOwnStoryPage)

//functionality for own story page 
function putOwnStoriesOnPage(user){
  $ownStories.empty();
  //if user has no stories posted, display message when visit own story page 
  //else display posted stories 
  if(user.ownStories.length === 0){
    const $noOwnStoriesDisplay = $('<p class="no-display">You currently have no stories posted</p>');
    $ownStories.append($noOwnStoriesDisplay)
  } else {
    user.ownStories.forEach(story => {
      const $story = generateStoryMarkup(story, false, true);
      console.log($story)
      $ownStories.append($story)
    })
  }
}

