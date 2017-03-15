# vuejs-daterange-picker
Vue.JS translation of [ComiSeo jQuery DateTime range picker](https://github.com/tamble/jquery-ui-daterangepicker)

To start working, issue these commands

``` bash
$ mkdir datepicker
$ cd datepicker
$ git clone https://github.com/tmcdos/vuejs-daterange-picker.git
$ npm install
$ npm run dev
```

Keep in mind that Node.js is configured to listen on all network interfaces (0.0.0.0:80) and this would require root account - so change it accordingly (**devServer** section in **webpack.config.js**)

You can invoke the component like this

``` html
<date-picker v-bind:options="object_with_properties"></date-picker>
```

The component actually consists of 3 sub-components
  
  - menu with presets (on the left)
  - row of month calendars with headings (on the right)
  - button panel (at the bottom)
  
The menu with presets is only visible if there is at least one preset defined.  
The button panel is only visible if at least one of the buttons is not hidden (with empty caption).  
The row of monthly calendars contains at least **1** and at most **3** months.  

Explanation of options:

|Property name|Type|Default|Description|
|---|---|---|---|
| cur_date | Date| `Today` | The **year** and **month** will be used to determine the rightmost calendar, the rest will be ordered backwards|
| startDate | Date | `null` | The start of the currently selected range |
| finalDate | Date | `null` | The end of the currently selected range |
| maxDate | Date or Number | `True` | Maximum allowed date - use **null** for no limitation; can be a relative number of days counted from **Today** |
| minDate | Date or Number | `True` | Minimum allowed date - use **null** for no limitation; can be a relative number of days counted from **Today** |
| firstDay | Integer | 1 | Which of the weekdays is the start of the week (1=Monday, ..., 7=Sunday) |
| applyOnMenuSelect | Boolean | `True` | Whether to simulate **Click** event for the **Apply** button after a range preset was chosen|
| applyButtonText | String | `'Apply'` | The caption for the **Apply** button - use empty string to hide the button|
| clearButtonText | String | `'Clear'` | The caption for the **Clear** button - use empty string to hide the button|
| cancelButtonText | String | `'Cancel'` | The caption for the **Cancel** button - use empty string to hide the button|
| initialText | String | `'Select date range...'` | A placeholder - shown while there is no range selected, use empty string to hide|
| rangeSplitter | String | `' - '` | String used between the start and end dates|
| numberOfMonths | Integer | 3 | How many month calendars to show (1, 2 or 3). A number less than 1 will show **1** month calendar, number greater than 3 will show **3** month calendars|
| stepMonths | Integer | 1 | Set how many months to move when clicking the **Previous/Next** links |
| hideIfNoPrevNext | Boolean | `False` | Normally the **previous** and **next** links are disabled when not applicable (see the `minDate` and `maxDate` options). You can hide them altogether by setting this attribute to `True` |
| yearSuffix | String | `""` | Additional text to display after the year in the month headers (e.g. AC/BC) |
| showMonthAfterYear | Boolean | `False` | Whether to show the month after the year in the header (default is before) |
| showWeek | Boolean | `False` | When **True**, a column is added to show the week of the year. The `calculateWeek` option determines how the week of the year is calculated |
| weekHeader | String | `Wk` | The text to display for the week of the year column heading. Use the `showWeek` option to display this column |
| showOtherMonths | Boolean | `False` | When **True**, first and last weeks of the given month are not clipped and include dates from previous and next month so that weeks always contain full 7 days |
| selectOtherMonths | Boolean | `False` | Only effective if `showOtherMonths` is **True**. When **True**, dates injected from the adjacent months in first and last week of the given month are selectable/clickable - otherwise disabled |
| monthNames | Array of String | English names | The list of full month names |
| monthNamesShort | Array of String | 3-letter English names | The list of abbreviated month names for use in month headers |
| dayNames | Array of String | English names | The list of the full weekday names ordered from Monday to Sunday |
| dayNamesShort | Array of String | 3-letter English names | The list of the abbreviated weekday names ordered from Monday to Sunday |
| dayNamesMin | Array of String | 2-letter English names | The list of the minimized weekday names ordered from Monday to Sunday |
| verticalOffset | Integer | 4 | Offset in pixels of the date-range picker relative to the trigger button |
| calculateWeek | Function | `iso8601` | A function to calculate the week of the year for a given date. The default implementation uses the **ISO-8601** definition - weeks start on a Monday; the 1-st week of the year contains the first Thursday of the year |
| presets | Object |<ul><li>Today</li><li>Yesterday</li><li>Last 7 days</li><li>Last week</li><li>Month to Date</li><li>Previous Month</li><li>Year to Date</li></ul>| Array of objects. Each object describes an item in the presets menu and must have the following properties:<br><table><tr><th>Property</th><th>Type</th><th>Description</th></tr><tr><td>text</td><td>String</td><td>The caption of the preset</td></tr><tr><td>dateStart</td><td>Date</td><td>The start of the date range</td></tr><tr><td>dateEnd</td><td>Date</td><td>The end of the date range</td></tr></table>|

Component emits the following events:

| Event | Arguments | Explanation |
|---|---|---|
|onApply|<ol><li>startDate (Date)</li><li>endDate (Date)</li></ol>| Event is generated by the **Apply** button|
|onCancel|   |Event is generated by the **Cancel** button|
