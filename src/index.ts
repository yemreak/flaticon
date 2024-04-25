import * as cheerio from "cheerio"

export enum Shape {
	ALL_SHAPES = "",
	OUTLINE = "outline",
	FILL = "fill",
	LINEAL_COLOR = "lineal-color",
	HAND_DRAWN = "hand-drawn",
}

export enum OrderBy {
	NONE = -1,
	POPULER = 4,
	RECENT = 2,
}

export type URLOptions = {
	shape?: Shape
	orderBy?: OrderBy
	craft?: boolean
}

export type SearchOptions = URLOptions & {
	count?: number
}

export type ImageResponse = {
	id: number
	name: string
	url: string
	pack: string
	downloads: number
}

export function createSearchURL(query: string, options?: Partial<URLOptions>) {
	const shape = options?.shape || Shape.ALL_SHAPES
	const orderBy = options?.orderBy || OrderBy.NONE

	let url = `https://www.flaticon.com/search?word=${query}`
	if (options?.shape) url += `&shape=${shape}`
	if (options?.orderBy) url += `&order_by=${orderBy}`
	if (options?.craft) url += `&craft=1`

	return encodeURI(url)
}

async function fetchAndParse(
	url: string,
	count: number
): Promise<ImageResponse[] | undefined> {
	const imageResponses: ImageResponse[] = []
	const response = await fetch(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36",
		},
	})
	const body = await response.text()
	const $ = cheerio.load(body)

	if ($("#alternative-search").length) return

	$("li.icon--item").each((i, elem) => {
		if (i >= count) return false

		try {
			const imageElement = $(elem) as any
			const url = imageElement.data("png")
			if (!url) return false

			const image = {
				id: url.split("?")[0].split("/").pop().split(".")[0],
				name: imageElement.data("name"),
				url,
				downloads: imageElement.data("downloads") || 0,
				pack: imageElement.data("pack_name") || "Unknown",
			}
			imageResponses.push(image)
		} catch (error) {
			throw new Error(`Failed to parse image: ${error}`)
		}
	})

	return imageResponses.length ? imageResponses : undefined
}

/**
 * Search for images on flaticon.com
 * @example
 * const imageResponses = await searchForImages("vscode", {
 * 	shape: Shape.HAND_DRAWN,
 * 	orderBy: OrderBy.POPULER,
 * })
 * if (!imageResponses) throw new Error("No images found")
 */
export async function searchForImages(
	query: string,
	options?: Partial<SearchOptions>
): Promise<ImageResponse[] | undefined> {
	const url = createSearchURL(query, options)

	const count = options?.count || 9
	return await fetchAndParse(url, count)
}
