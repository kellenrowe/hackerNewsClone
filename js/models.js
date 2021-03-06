const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ title, author, url, username, storyId, createdAt }) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    // this.url
    return this.url;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */


class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }



  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */


  async addStory(user, newStory) {
    // console.log('newStory', newStory);

    const data = {
      token: user.loginToken,
      story: {
        author: newStory.author,
        title: newStory.title,
        url: newStory.url
      }
    };

    // console.log('data',data);
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data
    }
    );

    console.log('response from Post request addStory:', response);
    const storyData = response.data.story;
    const story = new Story(storyData);
    user.ownStories.unshift(story);
    this.stories.push(story);
    return story;
  }

  /* Given a story ID, finds the corresponding instance of Story */

  findStoryInstance(storyID) {
    // refactoring: see if you can do this using .find() or other array method
    for (let story of this.stories) {
      if (story.storyId === storyID) {
        return story
      }
    }
  }

  /** function updates storylist after user removes added story */
  removeStory(story) {
    this.stories = this.stories.filter(function(val) {
      return val.storyId !== story.storyId
    });
  }

}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    stories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = stories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });
    console.log('response.data.user', response.data.user);

    return new User(response.data.user, response.data.token);
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
      return new User(response.data.user, token);
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /* Given a storyID, update the currentUser favorites array and
  send a post request to the server to update the user favorites information. */

  async addStoryToFavorites(storyID) {

    // finds instance of story
    const favoriteStory = storyList.findStoryInstance(storyID);

    // update user.favorites
    this.favorites.unshift(favoriteStory);

    // send post request
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyID}`,
      method: "POST",
      params: { token: this.loginToken },
    });
    // console.log('response from favorites request', response);
  }


  /* Given a storyID, update current favorites array and send a delete request
  to server to update user favorites information */
  // REFACTOR: keep add/ remove, but create a utility function that just makes the response

  async removeStoryFromFavorites(storyID) {
    this.favorites = this.favorites.filter( function(val) {
      return val.storyId !== storyID
    });

    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyID}`,
      method: "DELETE",
      params: { token: this.loginToken },
    });
  }

  /* Takes in a story and checks if that story is in the user instance's favorites */

  checkIfInFavorites(story) {
    return this.favorites.some(fav => fav.storyId === story.storyId);
  }

  async removeMyStory(story) {
    this.ownStories = this.ownStories.filter(function (val) {
      return val.storyId !== story.storyId;
    })

    const response = await axios({
      url: `${BASE_URL}/stories/${story.storyId}`,
      method: "DELETE",
      params: { token: this.loginToken },
    });

  }

}
