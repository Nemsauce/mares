#!/bin/sh
# check-no-hex.sh: keeps design values in tokens (docs/BUILD.md, section 2.7).
#
# Fails (exit 1) with a per-line report when it finds, in layout, sections,
# blocks, snippets, templates, assets, config or locales:
#   1. a hex color (#rgb, #rgba, #rrggbb, #rrggbbaa) in any file, except
#      assets/tokens.css
#   2. rgb()/rgba()/hsl()/hsla()/hwb()/lab()/lch()/oklab()/oklch() in any file,
#      except assets/tokens.css
#   3. a CSS named color (red, coral, white...) in a .css file, except
#      assets/tokens.css. transparent, currentColor and inherit are allowed.
#      CSS comments are ignored for this rule only.
#   4. a width media condition other than 600px or 1024px in an @media rule,
#      a matchMedia() string or a media="" attribute (tokens.css included).
#
# Usage: sh scripts/check-no-hex.sh    (run from anywhere; it moves to the repo root)
# Needs only POSIX tools (grep, sed, awk, find). No node, no packages.
#
# Known limits: named colors are not checked outside .css files (a `red` in an
# inline style="" or a {% style %} block is not caught; hex and rgb() are).
# A media query split over several lines is not checked.

cd "$(dirname "$0")/.." || exit 2

DIRS="layout sections blocks snippets templates assets config locales"
TOKENS_FILE="assets/tokens.css"

# ---------------------------------------------------------------------------
# ALLOWLIST (hex rule only). Keep it as narrow as possible.
# A hex-looking match is ignored only when the matched text itself STARTS with
# one of these prefixes. The rest of the line is still checked, so
#   <a href="#main" style="color:#fff">   still fails on #fff.
#   href="#   a fragment link such as href="#main" or href="#cafe"; an in-page
#             anchor whose id happens to be made of hex letters is not a color.
#   &#        a numeric HTML entity such as &#169; (looks like #169).
# To add an exception, add the prefix to HEX_ALLOW_RE and explain it here.
# ---------------------------------------------------------------------------
HEX_ALLOW_RE='^[0-9]+:(href=["'"'"']#|&#)'

HEX_RE='(href=["'"'"']|&)?#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})([^0-9A-Za-z_-]|$)'
FUNC_RE='(^|[^A-Za-z0-9_-])(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)[[:space:]]*\('

# CSS named colors (CSS Color 4) minus transparent. A name only counts when it
# stands alone as a value: after a space, colon, comma or "(", and before a
# space, ";", ",", ")", "}", "!" or end of line. So --color-coral, .red,
# white-space and tan() are not matches.
NAMED_RE='(^|[:[:space:](,])(aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)([[:space:];,)}!]|$)'

# Where a media condition can live: an @media prelude, the string passed to
# matchMedia(), or a media="" attribute.
MEDIA_FRAGMENT_RE='@media[^{]*|matchMedia\([[:space:]]*("[^"]*"|'"'"'[^'"'"']*'"'"')|media=("[^"]*"|'"'"'[^'"'"']*'"'"')'
# width: (min-width: 600px), (width >= 600px)      value follows the operator
WIDTH_FWD_RE='(min-|max-)?(device-)?width[[:space:]]*(:|[<>]=?|=)[[:space:]]*[^)[:space:]]+'
# (600px <= width)                                 value precedes the operator
WIDTH_REV_RE='[^(:<>=[:space:]]+[[:space:]]*[<>]=?[[:space:]]*(min-|max-)?(device-)?width'

fail() { # file line rule found
	found=$(printf '%s' "$4" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')
	printf 'FAIL %s:%s  [%s]  %s\n' "$1" "$2" "$3" "$found"
	printf '       %s\n' "$(sed -n "${2}p" "$1" | sed -E 's/^[[:space:]]+//' | cut -c1-200)"
}

# Blank out /* ... */ comments but keep line numbers.
strip_css_comments() {
	awk '
	{
		out = ""; line = $0
		while (length(line) > 0) {
			if (incomment) {
				i = index(line, "*/")
				if (i == 0) { line = "" }
				else { line = substr(line, i + 2); incomment = 0; out = out " " }
			} else {
				i = index(line, "/*")
				if (i == 0) { out = out line; line = "" }
				else { out = out substr(line, 1, i - 1) " "; line = substr(line, i + 2); incomment = 1 }
			}
		}
		print out
	}' "$1"
}

check_colors() { # file
	f=$1
	[ "$f" = "$TOKENS_FILE" ] && return
	grep -onE "$HEX_RE" "$f" | grep -vE "$HEX_ALLOW_RE" | while IFS= read -r hit; do
		fail "$f" "${hit%%:*}" "hex color" "${hit#*:}"
	done
	grep -oniE "$FUNC_RE" "$f" | while IFS= read -r hit; do
		fail "$f" "${hit%%:*}" "color function" "${hit#*:}"
	done
	case $f in
	*.css)
		strip_css_comments "$f" | grep -oniE "$NAMED_RE" | while IFS= read -r hit; do
			fail "$f" "${hit%%:*}" "named color" "${hit#*:}"
		done
		;;
	esac
}

check_breakpoints() { # file
	f=$1
	grep -noiE "$MEDIA_FRAGMENT_RE" "$f" | while IFS= read -r hit; do
		n=${hit%%:*}
		frag=${hit#*:}
		{
			printf '%s\n' "$frag" | grep -oiE "$WIDTH_FWD_RE" |
				sed -E 's/^[^:<>=]*(:|[<>]=?|=)[[:space:]]*//'
			printf '%s\n' "$frag" | grep -oiE "$WIDTH_REV_RE" |
				sed -E 's/^([^<>=[:space:]]+).*$/\1/'
		} | while IFS= read -r value; do
			lower=$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')
			case $lower in
			600px | 1024px) ;;
			*) fail "$f" "$n" "breakpoint" "width $value (only 600px and 1024px allowed)" ;;
			esac
		done
	done
}

existing=""
for d in $DIRS; do [ -d "$d" ] && existing="$existing $d"; done
if [ -z "$existing" ]; then
	echo "check-no-hex: none of the theme directories exist; nothing to scan."
	exit 2
fi

# shellcheck disable=SC2086
files=$(find $existing -type f | LC_ALL=C sort)

report=$(
	printf '%s\n' "$files" | while IFS= read -r f; do
		[ -n "$f" ] || continue
		grep -qI . "$f" 2>/dev/null || continue # skip binary and empty files
		check_colors "$f"
		check_breakpoints "$f"
	done
)

if [ -n "$report" ]; then
	printf '%s\n' "$report"
	count=$(printf '%s\n' "$report" | grep -c '^FAIL')
	printf '\ncheck-no-hex: FAILED, %s violation(s). Use var(--token) from assets/tokens.css; breakpoints are 600px and 1024px only.\n' "$count"
	exit 1
fi

scanned=$(printf '%s\n' "$files" | grep -c .)
printf 'check-no-hex: OK. %s file(s) scanned, no color literals, no off-grid breakpoints.\n' "$scanned"
