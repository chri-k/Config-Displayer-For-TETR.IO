export class Key {
    constructor({x, y, width, height, topText, middleText, bottomText}) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.width = width ?? 0;
        this.height = height ?? 0;
        this.topText = topText ?? "";
        this.middleText = middleText ?? ""
        this.bottomText = bottomText ?? "";

        this.labels = [];
    }

    static heightName = 12;
    static heightLabel = 16;

    static styleName(ctx, color, size = Key.heightName) {
        ctx.fillStyle = color
        ctx.font = "normal " + size + "px serif"
    }

    static styleLabel(ctx, color, size = Key.heightLabel) {
        ctx.fillStyle = color
        ctx.font = "bold " + size + "px monospace"
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} xoffset
     * @param {number} yoffset 
     * @param {string} stroke
     * @param {string} fill
     * @param {string} shadow
     * @param {string} text
     */
    draw(ctx, xoffset, yoffset, stroke, fill, shadow, text) {
        ctx.strokeStyle = stroke
        ctx.fillStyle = shadow
        ctx.beginPath()
        ctx.roundRect(xoffset + this.x, yoffset + this.y, this.width, this.height, 5);
        ctx.fill()
        ctx.stroke()

        ctx.beginPath()
        ctx.fillStyle = fill
        ctx.roundRect(xoffset + this.x + 6, yoffset + this.y + 4, this.width - 12, this.height - 14, 5);
        ctx.fill()

        const fontSize = 12;
        ctx.beginPath()
        Key.styleName(ctx, text);
        ctx.fillText(this.topText, xoffset + this.x + 9, yoffset + this.y + 14);
        ctx.fillText(this.middleText, xoffset + this.x + 9, yoffset + this.y + 14 + fontSize);
        ctx.fillText(this.bottomText, xoffset + this.x + 9, yoffset + this.y + 14 + fontSize * 2);

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} xoffset
     * @param {number} xoffset
     * @param {number} yoffset 
     */
    drawLabels(ctx, color, yoffset, xoffset) {
        if (this.labels.length == 0) return;

        Key.styleName(ctx, color);
        const topWidth = ctx.measureText(this.topText).width;
        Key.styleLabel(ctx, color);

        let fontSize = Key.heightLabel;

        const maxWidth = this.width - 10;
        const maxHeight = this.height - 10;

        const labelMargin = 10;  // Horizontal space in between labels
        const rowMargin = 0;     // Vertical ''

        // Layout the labels using magic

        const widths = this.labels.map(text => ctx.measureText(text).width);

        const totalWidth = widths.reduce((a, b) => a + b) + labelMargin * (widths.length - 1);
        const totalArea = totalWidth * (fontSize + rowMargin);
        const scaleEstimate = maxWidth * maxHeight > totalArea ? 1 : maxWidth * maxHeight / totalArea;

        const rows = [[[], 0]]; // uhhh

        let j = 0;
        let first = true;
        let rowWidth = -labelMargin;
        let blockHeight = fontSize;
        let blockWidth = 0;
        for (let i = 0; i < this.labels.length; i++) {
            let text = this.labels[i];
            let width = widths[i];
            if (first || (rowWidth + width + labelMargin) < maxWidth / scaleEstimate - (j ? 0 : topWidth + 2)) {
                first = false;
                rows[j][0].push([text, width]);
                rowWidth += width + labelMargin
            } else {
                rows[j][1] = rowWidth;
                rows.push([[[text, width]], 0]);
                j++;
                if (blockWidth < rowWidth) blockWidth = rowWidth;
                rowWidth = width;
                blockHeight += fontSize + rowMargin;
            }
        }

        rows[j][1] = rowWidth;
        if (blockWidth < rowWidth) blockWidth = rowWidth;

        // Shrink the text if it doesn't fit

        let scale = 1;

        if (blockWidth > maxWidth) scale *= maxWidth / blockWidth;
        if (blockHeight > maxHeight) scale *= maxHeight / blockHeight;

        // Shift first row to not obscure the key name (if necessary)

        const shift = rows.length > 1 && topWidth * 2 > this.width - blockWidth - 20;
        Key.styleLabel(ctx, color, fontSize * scale);

        blockHeight += fontSize * scale;

        first = true;
        let rowOffset = fontSize * scale;
        for (let [row, rowWidth] of rows) {
            rowWidth *= scale;
            let offset = 0;
            for (let [text, width] of row) {
                ctx.fillText(text, shift * first * (topWidth / 2 + 1) + xoffset + this.x + offset + (this.width - rowWidth) / 2, yoffset + this.y + 4 + rowOffset + (this.height - 4 - blockHeight * scale) / 2);
                offset += (width + labelMargin) * scale;
            }
            rowOffset += (fontSize + rowMargin) * scale;
            first = false;
        }
    }


    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} color 
     * @param {number} xoffset 
     * @param {number} yoffset 
     */
    highlight(ctx, color, xoffset, yoffset) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(xoffset + this.x, yoffset + this.y, this.width, this.height, 5);
        ctx.fill()
    }
}
