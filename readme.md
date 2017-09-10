Riker is a Chrome extension that aims to help one grapple with managing many tabs, in particular as a result of content discovery.

It aims to help people who frequently engage in content discovery routines by visiting sites (e.g. Reddit, Hacker News, news sources, etc.) and opening tabs as reminders for looking at something they think might be interesting.

# Impetus

This section explains the impetus for this project. I took the time to write it all out in order to solidify my understanding of what I think is the problem that this project aims to solve.

Riker aims to fill what I believe is a hole in the content discovery and archiving process. On one end we have a single or multiple browser tabs which may serve as reminders but are really meant to be more ephemeral than something with permanence like bookmarks. On the other end we have something like bookmarks and going further something like Pinboard.

However, when we visit Hacker News or r/programming and see multiple seemingly-interesting stories, it doesn't necessarily mean we have the time to determine if they are indeed worthy of being saved for the longer term in the form of a bookmark or Pinboard.

One might say, "If you don't have the time, then why go there at all?". The reason should be understandable to any reasonable person: one may very well have free time to visit a content discovery site, but may not have the time to delve deeper by reading the actual articles in order to come to a determination as to whether or not they are worthy of being saved permanently, and that's not even taking into account the various rabbit holes one can get into by following links from within the article itself.

## Shallow Discovery

One may recognize the worth of periodically performing such a "shallow" traversal content discovery even if they don't have the time for a "full" traversal, aware of the possibility that those items that may be of personal interest may be bumped out of their prominence on the front page if they wait until they do have enough time. I have personally experienced this a few times, a serendipitous moment of finding a story about something extremely pertinent to me at that point in time, which I surely would have missed if I hadn't checked when I did.

Think of this as a sort of "staging area" for content discovery, one that I believe is currently under-served by a lack of tools to manage it.

Some of us who recognize the benefit of doing this sort of "shallow" content discovery periodically are faced with an issue. How do we store this ephemeral state? As mentioned, these links are in a "staging" state where we're not sure if we _want_ to confer them the sort of permanence that bookmarks/Pinboard provide. "Just bookmark them temporarily until you get the time to decide." The problem for me is that I tend to forget about anything I ever bookmark, which would only result in these accumulating and never being seen, which defeats the purpose of having done so, so inevitably I would stop doing so. I feel like bookmarks UI/UX in general can use some work.

## Stopgap

I have seen some tools which show you the state of the Hacker News front page, for example, as it looked at some point in the past. There are a few reasons why this is not a solution for me.

First, shallow discovery is something that I _enjoy_ doing. I may not have the time to do a deep discovery, but a shallow discovery still gives me a feeling of staying abreast on the goings on of the Internet. Reading comments tends to be very insightful as well. Shallow discovery is something that I _want_ to do as a relaxing break.

More generally, however, is that this kind of shallow discovery process is not limited to Reddit and Hacker News, for which these kinds of tools may exist; I merely used them as examples. I may also find interesting links while browsing organically, for example, and likewise may not have the time to give them their full proper consideration.

Instead what I've taken to doing is opening tabs for each link as a blatant, unavoidable reminder that they should be looked at. This achieves its intended goal, albeit inefficiently. "Pruning" is what I call the process of actually going through the tabs, digesting them, and deciding what to do with them.

Sometimes I'll be particularly busy or simply without time to prune, but with enough time to do a quick, shallow content discovery. This naturally results in the accumulation of tabs which can quickly project the total tab count at about 100, which naturally creates performance issues (despite something like The Great Discarder), particularly at launch, which creates friction and a discouraging factor to launching Chrome, which is why I sometimes end up launching Firefox instead.

## Pruning

I've identified a few noteworthy details when it comes to the actual pruning process.

Some tabs are trivial to judge. In the extreme case they were opened accidentally (very rare). Others are things I definitely know that I want to save via e.g. Pinboard. Others are things I can "defer" to another queue, such as YouTube videos which I can add to my Watch Later queue. Some I later determine were only interesting for their headlines or comments, but I had no real interest in actually digesting them, so they could be discard easily. I tend to take care of these before they ever become tab-reminders, but sometimes I'll lack the time to do so or forget.

Other tabs are legitimately interesting. I take my time digesting the tab, possibly blocking that process by following one of many rabbit holes contained within it, which may spawn more tabs. Afterward I decide whether it's something I should save permanently on Pinboard.

Naturally, the order in which tabs are pruned has a profound effect on efficiency. If I don't have much time to prune tabs, it would be better to only prune the "easy" tabs mentioned first. In fact, this is what I tend to do: short pruning "sprints" where I'll prune the seemingly-easiest tabs as quickly as possible, which leaves behind a "hardened set" of tabs that survived the pruning process. Subsequent rounds of pruning sprints reinforces the hardened set of tabs that remain.

Eventually this hardened set accumulates to a size that requires attention. I've noticed that when I reach this point I am more likely to not actually digest the tab content due to the pressure of the size of the hardened set, and I am more likely to skim and save to Pinboard if I deem that, despite not consuming it, it may be useful to revisit in a more pertinent situation.

## Solution

Browser bookmarks seem to be closest to what I would like. The main problem I have is that browser bookmark UI/UX has always seemed to be lacking. I liken it to storing short-lived, frequently-accessed data in deep, cold storage tape drives (or Amazon Glacier) instead of a simple, in-memory key-value store.

Originally I was thinking of storing these URLs in the extension using the storage API but I realized that I would be replicating much of Bookmarks. For this reason, I decided on building _on top of_ Bookmarks. Saved URLs will be stored as Bookmarks and additional metadata will be saved by the extension and cross-referenced. This has the added benefit that the bookmarks will be accessible through all other devices, even mobile devices which may not support extensions. One potential issue is that users may mess around with the Bookmarks if they see them.

# Tasks

* [ ] Save current tab.
* [ ] Save selected tabs.
* [ ] Highlight icon when URL is already saved.
    * [ ] Highlight different shade if URL is similar, such as different hash or
          query parameters.
* [ ] Tags?
    * Adding tags implies more permanence than is intended, but also makes it
      easier to manage many links. Perhaps support a single tag and use it as
      the name of the sub-folder in which they will be stored.
    * [ ] Tag operations:
        * [ ] Rename tag.
        * [ ] Delete tag.
    * [ ] Bulk link list tag operations:
        * [ ] Apply tag.
        * [ ] Remove tag.
* [ ] Per-save popup:
    * [ ] Pre-fill with data:
        * [ ] Favicon
        * [ ] Title
        * [ ] URL
        * [ ] Default alarm preset (e.g. none)
    * [ ] Indicate when current tab URL is already saved.
    * [ ] Tab alarm.
* [ ] Tab alarm. See [snooze tabs].
    * [ ] Custom datetime with datetime picker.
    * [ ] Preset:
        * [ ] Later today
        * [ ] Tomorrow
        * [ ] This Weekend
        * [ ] Next Week
        * [ ] Next Month
        * [ ] Next time browser is launched
    * [ ] Option: Shows notification for awakened tab(s).
        * [ ] Coalesce multiple notifications.
    * [ ] Option: Auto-open awakened tab(s).
        * [ ] Coalesced multiple tabs open in new window.
        * [ ] Notification click: focus awakened tab or window.
* [ ] Options
    * [ ] Show save count badge.
    * [ ] Close tab(s) on save.
    * [ ] Sync data.
    * [ ] Global shortcut to save active/selected tabs.
        * [ ] Show popup, like LastPass account detection.
    * [ ] Rate of ingress/egress ratio warning.
    * [ ] Global tab egress schedule.
* [ ] Tab list page for bulk-saving.
    * [ ] Group by window.
* [ ] View saved links page.
    * [ ] Peek link(s); opens without removing.
    * [ ] Wake link(s); opens and removes.
    * [ ] Schedule link alarm.
    * [ ] Export:
        * [ ] JSON
        * [ ] Bookmark
        * [ ] Pinboard
* [ ] Search saved links via Omnibox
* [ ] Item view (tabs and links):
    * [ ] Sort orders:
        * [ ] By host.
        * [ ] By sub-reddit (already implicit?).
        * [ ] Random.
        * [ ] Date.
    * [ ] Item selection:
        * [ ] Select all (filtered implied).
        * [ ] Select inverse.
        * [ ] Range-select tabs.
        * [ ] Individual-select tabs.
    * [ ] Filtering:
        * [ ] Option: Group by host.
        * [ ] Filter box.
            * [ ] Literal by default.
            * [ ] Components:
                * [ ] `host:` - filter by host (auto-complete present hosts?)
                * [ ] `regex:` - filter by regular expression
                * [ ] Boolean operators? `AND`, `OR`, `NOT`
    * [ ] Judge tabs:
        * [ ] Opens tab with a saved link.
        * [ ] Verdict bar at the top. Use [programmatic injection].
            * [ ] Judge with "👎" or "👍" buttons, with shortcuts.
            * [ ] Show details:
                * [ ] Saved date.
                * [ ] Existing alarm.
            * [ ] Can alter or set alarm.
        * [ ] Judging proceeds to next tab in the order seen in link list.

[Snooze tabs]: https://testpilot.firefox.com/experiments/snooze-tabs/
[programmatic injection]: https://developer.chrome.com/extensions/content_scripts#pi

# License

This extension is licensed under the MIT license.

The plum icon was obtained from <https://icons8.com/icon/19526/plum>.

# Resources

Note that MDN's WebExtension docs tend to be more detailed than Chrome's.

* [MDN - WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)
* [MDN - Porting a Google Chrome extension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Porting_a_Google_Chrome_extension)
* [MDN - Chrome Incompatibilities](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities)
* [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
* https://www.extensiontest.com/
