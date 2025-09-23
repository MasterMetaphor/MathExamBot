from PIL import Image
import os

# Define the color palette
PALETTE = {
    "rocket_body": (210, 210, 215),
    "rocket_shadow": (150, 150, 155),
    "window": (173, 216, 230),
    "window_shine": (255, 255, 255),
    "alien": (118, 204, 118),
    "flame_yellow": (255, 224, 102),
    "flame_orange": (255, 153, 51),
    "explosion_1": (255, 159, 0),
    "explosion_2": (255, 107, 0),
    "explosion_3": (255, 64, 0),
    "debris_light": (180, 180, 180),
    "debris_dark": (120, 120, 120),
    "black": (0, 0, 0),
}

# Define the new rocket mascot designs
MASCOT_FRAMES = {
    # Idle animation: rocket hovering with a smaller, pulsating flame
    "idle_1": [
        "      .A.      ",
        "     /RRR\\     ",
        "    |RRSRR|    ",
        "    |RswsR|    ",
        "    |RsasR|    ",
        "    |RRSRR|    ",
        "   /RRRRRRR\\   ",
        "  /RRRRRRRRR\\  ",
        " |RR|RRRRR|RR| ",
        "  ^ | | | | ^  ",
        "      f f      ",
        "", "", "",
    ],
    "idle_2": [
        "      .A.      ",
        "     /RRR\\     ",
        "    |RRSRR|    ",
        "    |RswsR|    ",
        "    |RsasR|    ",
        "    |RRSRR|    ",
        "   /RRRRRRR\\   ",
        "  /RRRRRRRRR\\  ",
        " |RR|RRRRR|RR| ",
        "  ^ | | | | ^  ",
        "     f F f     ",
        "      f f      ",
        "", "",
    ],
    # Correct animation: rocket blasts off with a rounded flame
    "correct_1": [
        "      .A.      ",
        "     /RRR\\     ",
        "    |RRSRR|    ",
        "    |RswsR|    ",
        "    |Rs^sR|    ",
        "    |RRSRR|    ",
        "   /RRRRRRR\\   ",
        "  /RRRRRRRRR\\  ",
        " |RR|RRRRR|RR| ",
        "  ^ | | | | ^  ",
        "    f F F f    ",
        "   (fFF FFFf)   ",
        "    (fFFFFf)    ",
        "     (fff)     ",
    ],
    "correct_2": [
        "      .A.      ", "     /RRR\\     ", "    |RRSRR|    ", "    |RswsR|    ", "    |Rs^sR|    ", "    |RRSRR|    ", "   /RRRRRRR\\   ", "  /RRRRRRRRR\\  ", " |RR|RRRRR|RR| ", "", "", "", "", "",
    ],
    "correct_3": [
        "      .A.      ", "     /RRR\\     ", "    |RRSRR|    ", "    |RswsR|    ", "    |Rs^sR|    ", "    |RRSRR|    ", "", "", "", "", "", "", "", "",
    ],
    "correct_4": [
        "      .A.      ", "     /RRR\\     ", "    |RRSRR|    ", "", "", "", "", "", "", "", "", "", "", "",
    ],
    # Incorrect animation: rocket breaks apart into chunks
    "incorrect_1": [
        "      .A.      ", "     /RRR\\     ", "    |RRSRR|    ", "    |RswsR|    ", " o  |RsasR|  o ", "    |RRSRR|    ", "   /RRRRRRR\\   ", "  /RRRRRRRRR\\  ", " |RR|RRRRR|RR| ", "  ^ | | | | ^  ", "    o O o      ", "", "", "",
    ],
    "incorrect_2": [
        "      .A.      ", "     /cR \\     ", "    |RCS c|    ", "    | sw R|    ", "  o | sa R| O  ", "    |cCS R|    ", "   /cRRRRC \\   ", "  /RRC cCR R\\  ", " |cR|R R R|Cr| ", "  ^ |o|O|o| ^  ", "  0 O o o O 0  ", "   o O 0 O o   ", "", "",
    ],
    "incorrect_3": [
        "               ", "      c C      ", "  o  C c O   c ", "    c   C      ", " O   C c   o   ", "   c       C   ", "  C   o O   c  ", " o  c  0  C  O ", "      O o      ", " C  o  c  0    ", "   0 O o O 0   ", "    o O 0 O    ", "", "",
    ],
    "incorrect_4": [
        "               ", "               ", "   c      C    ", "  o     c      ", "      C     o  ", " C             ", "       o       ", "   o      C    ", "  c            ", "         0     ", "    o     c    ", "               ", "", "",
    ],
    "mini_rocket": [
        "  A  ",
        " /R\\ ",
        "|RSR|",
        "|RRR|",
        " FfF ",
    ],
}

# Map characters to colors
COLOR_MAP = {
    ' ': None, '.': PALETTE["rocket_body"], 'A': PALETTE["rocket_body"], 'R': PALETTE["rocket_body"], 'S': PALETTE["rocket_shadow"], 'w': PALETTE["window_shine"], 's': PALETTE["window"], 'a': PALETTE["alien"], 'f': PALETTE["flame_yellow"], 'F': PALETTE["flame_orange"], '^': PALETTE["alien"], '|': PALETTE["rocket_shadow"], '/': PALETTE["rocket_shadow"], '\\': PALETTE["rocket_shadow"], 'o': PALETTE["explosion_1"], 'O': PALETTE["explosion_2"], '0': PALETTE["explosion_3"], '(': PALETTE["flame_orange"], ')': PALETTE["flame_orange"], 'c': PALETTE["debris_light"], 'C': PALETTE["debris_dark"],
}

def generate_pixel_art(grid, output_path, scale=20):
    grid_height = 14  # Standard canvas height
    grid_width = 15   # Standard canvas width
    
    img_width = grid_width * scale
    img_height = grid_height * scale
    
    image = Image.new("RGBA", (img_width, img_height), (255, 255, 255, 0))
    
    for y, row in enumerate(grid):
        for x, char in enumerate(row):
            color = COLOR_MAP.get(char)
            if color:
                for i in range(x * scale, (x + 1) * scale):
                    for j in range(y * scale, (y + 1) * scale):
                        image.putpixel((i, j), color)
                        
    image.save(output_path, "PNG")
    print(f"Mascot art saved to {output_path}")

def clear_old_mascots(directory="static"):
    for filename in os.listdir(directory):
        if filename.startswith("mascot_") and filename.endswith(".png"):
            os.remove(os.path.join(directory, filename))
            print(f"Removed old mascot: {filename}")
        if filename == "mini_rocket.png":
            os.remove(os.path.join(directory, filename))
            print(f"Removed old mini_rocket.png")

if __name__ == "__main__":
    clear_old_mascots()
    for frame_name, frame_grid in MASCOT_FRAMES.items():
        output_filename = f"static/mascot_{frame_name}.png"
        generate_pixel_art(frame_grid, output_filename)
    generate_pixel_art(MASCOT_FRAMES["mini_rocket"], "static/mini_rocket.png", scale=5)
