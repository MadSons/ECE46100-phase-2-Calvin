"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_request_1 = require("../src/graphql_request");
const logger_1 = __importDefault(require("../src/logger"));
const bus_factor_1 = require("../src/bus_factor");
// 3 test cases
// Mock the dependencies
jest.mock('../src/graphql_request');
jest.mock('../src/logger');
describe('getBusFactor', () => {
    const owner = 'testOwner';
    const repoName = 'testRepo';
    // Test case for a successful Bus Factor calculation
    it('should return the bus factor and elapsed time for a valid repository', async () => {
        const mockResponse = {
            data: {
                repository: {
                    defaultBranchRef: {
                        target: {
                            history: {
                                edges: [
                                    { node: { author: { user: { login: 'user1' } } } },
                                    { node: { author: { user: { login: 'user2' } } } },
                                    { node: { author: { user: { login: 'user1' } } } },
                                    { node: { author: { user: { login: 'user3' } } } },
                                ]
                            }
                        }
                    }
                }
            }
        };
        // Mock the graphqlRequest function to return the mock response
        graphql_request_1.graphqlRequest.mockResolvedValueOnce(mockResponse);
        const result = await (0, bus_factor_1.getBusFactor)(owner, repoName);
        // Expect the result to be an array containing the calculated score and elapsed time
        expect(result).toHaveLength(2);
        expect(result[0]).toBeGreaterThan(0); // Expect a valid bus factor score
    });
    // Test case for a repository with no commits
    it('should handle a repository with no commits', async () => {
        const mockResponse = {
            data: {
                repository: {
                    defaultBranchRef: {
                        target: {
                            history: {
                                edges: []
                            }
                        }
                    }
                }
            }
        };
        // Mock the graphqlRequest function to return the mock response
        graphql_request_1.graphqlRequest.mockResolvedValueOnce(mockResponse);
        const result = await (0, bus_factor_1.getBusFactor)(owner, repoName);
        // Expect the score to be calculated correctly, should be 1 in this case
        expect(result[0]).toBe(1);
    });
    // Test case for handling errors in the GraphQL request
    it('should log an error if the GraphQL request fails', async () => {
        // Mock the graphqlRequest function to throw an error
        graphql_request_1.graphqlRequest.mockRejectedValueOnce(new Error('GraphQL request failed'));
        await expect((0, bus_factor_1.getBusFactor)(owner, repoName)).rejects.toThrow('GraphQL request failed');
        // Check if logger was called with the correct debug message
        expect(logger_1.default.debug).toHaveBeenCalledWith("Calling GraphQL for Bus Factor");
    });
});
//# sourceMappingURL=bus_factor.test.js.map