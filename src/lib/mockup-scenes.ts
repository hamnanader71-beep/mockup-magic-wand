export type Scene = {
  id: string;
  label: string;
  prompt: string;
};

const KEEP =
  "Keep the product in the photo exactly identical to the uploaded image: same shape, colors, stitches, hardware and proportions. Do not redesign it. Photorealistic lifestyle product photography, soft natural light, warm neutral tones, high detail, square composition.";

export const SCENES: Scene[] = [
  {
    id: "flatlay-linen",
    label: "Linen flat lay",
    prompt: `Place the product as a styled flat lay on a cream linen cloth over a warm wooden table, with eucalyptus sprigs, dried baby's breath in a glass vase and a ball of yarn nearby. ${KEEP}`,
  },
  {
    id: "studio-white",
    label: "Clean studio",
    prompt: `Studio catalog shot of the product on a seamless off-white background with a soft shadow underneath, centered, minimal and clean. ${KEEP}`,
  },
  {
    id: "model-crossbody",
    label: "Worn by model",
    prompt: `The product worn/held by a woman in a white linen shirt and light blue jeans in a bright minimal room, cropped from shoulders to hips, natural window light. ${KEEP}`,
  },
  {
    id: "pattern-cover",
    label: "Pattern cover",
    prompt: `Marketing cover graphic on a cream background: the product on the right, with elegant dark brown serif headline text "CROCHET PATTERN" and a smaller subtitle line on the left, a small heart divider, refined boho e-commerce listing style. ${KEEP}`,
  },
  {
    id: "feature-callouts",
    label: "Feature callouts",
    prompt: `Infographic style listing image on a cream background: the product centered, with 4 small circular zoom-in detail bubbles connected by thin dotted lines and short dark brown label texts around it, tidy editorial layout. ${KEEP}`,
  },
  {
    id: "craft-desk",
    label: "Craft desk",
    prompt: `The product on a white table surrounded by balls of yarn, a crochet hook, small gold scissors, dried pampas and eucalyptus in vases, soft daylight. ${KEEP}`,
  },
  {
    id: "in-use",
    label: "In use",
    prompt: `Overhead shot of the product open and in use on a cream fabric backdrop with dried flowers around, showing what it holds, cozy handmade mood. ${KEEP}`,
  },
  {
    id: "thank-you",
    label: "Thank you card",
    prompt: `Cream flat lay banner with lots of empty space: the product in the bottom-left corner, eucalyptus in the bottom-right, crochet fabric top-right, and centered dark brown serif text "THANK YOU!" with a small heart and the line "FOR SUPPORTING HANDMADE". ${KEEP}`,
  },
  {
    id: "closeup-detail",
    label: "Texture close-up",
    prompt: `Extreme close-up macro shot of the product's texture and hardware detail, shallow depth of field, warm soft light. ${KEEP}`,
  },
  {
    id: "shelf-styling",
    label: "Shelf styling",
    prompt: `The product styled on a light wooden shelf next to a ceramic vase, stacked books and a small plant, airy Scandinavian interior, soft shadows. ${KEEP}`,
  },
];
