import fetchMock from "jest-fetch-mock"
import {
	OrderBy,
	Shape,
	createSearchURL,
	fetchAndParse,
	searchForImages,
} from "./index" // Adjust the import path accordingly

fetchMock.enableMocks()

beforeEach(() => {
	fetchMock.resetMocks()
})

describe("createSearchURL", () => {
	it("generates correct URL with default options", () => {
		const url = createSearchURL("icon")
		expect(url).toBe("https://www.flaticon.com/search?word=icon")
	})

	it("generates correct URL with all options", () => {
		const options = { shape: Shape.FILL, orderBy: OrderBy.POPULER, craft: true }
		const url = createSearchURL("icon", options)
		expect(url).toBe(
			"https://www.flaticon.com/search?word=icon&shape=fill&order_by=4&craft=1"
		)
	})
})

describe("fetchAndParse", () => {
	it("parses valid HTML and returns image data", async () => {
		const mockHtml = `
      <ul>
        <li class="icon--item" data-png="http://example.com/image.png" data-name="Test Icon" data-downloads="100" data-pack_name="Test Pack"></li>
      </ul>
    `
		fetchMock.mockResponseOnce(mockHtml)
		const url = "http://example.com"
		const results = await fetchAndParse(url, 1)
		expect(results).toEqual([
			{
				id: "image",
				name: "Test Icon",
				url: "http://example.com/image.png",
				downloads: 100,
				pack: "Test Pack",
			},
		])
	})

	it("returns undefined if no icons are found", async () => {
		fetchMock.mockResponseOnce('<div id="alternative-search"></div>')
		const results = await fetchAndParse("http://example.com", 1)
		expect(results).toBeUndefined()
	})
})

describe("searchForImages", () => {
	it("returns images using the query and options provided", async () => {
		const mockHtml = `
      <ul>
        <li class="icon--item" data-png="http://example.com/image.png" data-name="VSCode Icon" data-downloads="150" data-pack_name="Dev Pack"></li>
      </ul>
    `
		fetchMock.mockResponseOnce(mockHtml)
		const options = { shape: Shape.HAND_DRAWN, orderBy: OrderBy.POPULER, count: 1 }
		const images = await searchForImages("vscode", options)
		expect(images).toEqual([
			{
				id: "image",
				name: "VSCode Icon",
				url: "http://example.com/image.png",
				downloads: 150,
				pack: "Dev Pack",
			},
		])
	})
})

describe("fetchAndParse Function", () => {
	it("should parse HTML correctly and return image data", async () => {
		const url = "https://www.flaticon.com/search?word=university&shape=lineal-color"
		const count = 5
		const result = await fetchAndParse(url, count)
		expect(result).toBeDefined()
		expect(result?.length).toBeGreaterThan(0)
		// You can add more expectations here to test specific parts of the parsed data
	}, 100000)
})
