import { TimestampToDate } from "./FormatDate";
import { FormatPrice, Round } from "./FormatNumber";
import { TruncateString } from "./FormatString";

export default {
    Round,
    TimestampToDate,
    FormatPrice,
    Currency: FormatPrice,
    TruncateString,
    TruncateText: TruncateString,
}