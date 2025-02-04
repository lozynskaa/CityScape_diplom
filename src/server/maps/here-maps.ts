import axios from "axios";
import { type AutosuggestDisplayItem, type AutosuggestResponse } from "./maps";
import { DEFAULT_LOCATION } from "~/lib/location";

class HereMapsService {
  private apiKey: string = process.env.HERE_API_KEY!;
  //   private appId: string = process.env.HERE_APP_ID!;

  async autosuggestAddress(address: string) {
    try {
      const response = await axios.get<AutosuggestResponse>(
        "https://autosuggest.search.hereapi.com/v1/autosuggest",
        {
          params: {
            q: address,
            apiKey: this.apiKey,
            at: `${DEFAULT_LOCATION.latitude},${DEFAULT_LOCATION.longitude}`,
          },
        },
      );

      const items = response.data.items.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.title,
        address: item.address,
        resultType: item.resultType,
        position: item.position,
      })) as AutosuggestDisplayItem[];

      return items;
    } catch (error) {
      console.log("🚀 ~ HereMapsService ~ autosuggestAddress ~ error:", error);
    }
  }
}

export const hereMaps = new HereMapsService();
