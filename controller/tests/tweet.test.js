import httpMocks from 'node-mocks-http';
import faker from 'faker'
import { TweetController } from '../tweet';

describe('TweetController', () => {
  let tweetController;
  let tweetsRepository;
  let mockedSocket;
  beforeEach(() => {
    tweetsRepository = {}
    // module에 있는 함수가 export 될때 묶여서 나오기 때문에
    mockedSocket = { emit: jest.fn() }
    tweetController = new TweetController(
      tweetsRepository, 
      () => mockedSocket
    );
  });

  describe('getTweets', () => {

    it('returns all tweets when username is not provided', async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const allTweets = [
        { text: faker.random.words(3) },
        { text: faker.random.words(3) },
      ]

      tweetsRepository.getAll = () => allTweets;

      await tweetController.getTweets(request, response)

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(allTweets);
    });

    it('returns tweets for the given user when username is provided', async () => {
      const username = faker.internet.userName();
      const request = httpMocks.createRequest({
        query: { username },
      });
      const response = httpMocks.createResponse();

      const userTweets = [
        { text: faker.random.words(3) }
      ]
      tweetsRepository.getAllByUsername = () => userTweets;

      // getAllByUsername이 호출되었는지 확인하기 위해서는?
      // tweetsRepository.getAllByUsername = jest.fn(() => userTweets)
      
      await tweetController.getTweets(request, response)

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(userTweets);
      // expect(tweetsRepository.getAllByUsername).toHaveBeenCalledTimes(1);

      // username이 호출이 되었는가?
      // expect(tweetsRepository.getAllByUsername).toHaveBeenCalledWith(username);

      // 직 간접적으로 검증이 되기때문에 굳이?

    });
  });

  describe('getTweet', () => {
    let tweetId, request, response

    beforeEach(() => {
      tweetId = faker.random.alphaNumeric(16);
      request = httpMocks.createRequest({
        params: { id: tweetId },
      });
      response = httpMocks.createResponse();
    })

    it('returns tweet if tweet exists', async () => {
      const aTweet = { text: faker.random.words(3) }

      tweetsRepository.getById = jest.fn(() => aTweet)

      await tweetController.getTweet(request, response);
                                    
      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(aTweet);
      expect(tweetsRepository.getById).toHaveBeenCalledWith(tweetId)
    });

    it('returns 404 if tweet does not exist', async () => {
      tweetsRepository.getById = jest.fn(() => undefined);

      await tweetController.getTweet(request, response);

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData()).toMatchObject({
        message: `Tweet id(${tweetId}) not found`
      });
      expect(tweetsRepository.getById).toHaveBeenCalledWith(tweetId)
    });
  });
  
})