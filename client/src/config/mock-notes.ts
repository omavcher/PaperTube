export interface MockNote {
  _id: string;
  title: string;
  content: string;
  videoUrl: string;
  thumbnail: string;
  generationDetails?: any;
  messages: {
    _id: string;
    role: string;
    content: string;
    timestamp: string;
    videoLink?: string;
    feedback?: "good" | "bad" | null;
    mode?: string;
  }[];
}

export const MOCK_NOTES: Record<string, MockNote> = {
  "notes-supply-and-demand-g9adizjpds": {
    _id: "mock-note-demand",
    title: "Supply and Demand: Crash Course Economics #4",
    videoUrl: "https://youtu.be/g9aDizJpd_s",
    thumbnail: "https://img.youtube.com/vi/g9aDizJpd_s/maxresdefault.jpg",
    generationDetails: { format: "notes", theme: "kraft" },
    messages: [
      {
        _id: "demand-m1",
        role: "assistant",
        content: "Hi! I'm PaperChat, set up to help you study the fundamentals of Market Economics. Ask me anything about demand curves, supply elasticity, or solving market equilibrium equations!",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: "demand-m2",
        role: "user",
        content: "What is the difference between a change in demand and a change in quantity demanded?",
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        _id: "demand-m3",
        role: "assistant",
        content: "A change in **quantity demanded** is a movement *along* the existing demand curve. It is caused solely by a change in the price of the good itself.\n\nA change in **demand** is a *shift of the entire curve* (left or right). It is caused by non-price factors (shifters) such as consumer income, tastes, price of related goods (substitutes/complements), or expectations.",
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
      }
    ],
    content: `# Supply and Demand: Crash Course Economics #4

## 📌 Executive Summary
Supply and Demand are the foundational pillars of market economics. They describe how buyers and sellers interact to determine the price and quantity of goods. When left uninterrupted, markets naturally seek an equilibrium point where the quantity buyers want matches the quantity sellers want to provide. Understanding these market forces is essential for analyzing consumer behavior, business strategies, and government policies.

---

## 1. The Law of Demand
The Law of Demand states that, ceteris paribus (all other things being equal), there is an **inverse relationship** between the price of a good and the quantity demanded. This means that as price increases, consumer demand falls, and vice versa.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200" alt="Consumer Market" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 1: Consumer market reflecting aggregate demand forces</p>
</div>

* **As Price ($P$) $\\uparrow$, Quantity Demanded ($Q_D$) $\\downarrow$**
* **As Price ($P$) $\\downarrow$, Quantity Demanded ($Q_D$) $\\uparrow$**

### The Substitution and Income Effects
The inverse relationship described by the Law of Demand is driven by two key economic concepts:
1.  **The Income Effect**: When the price of a good drops, consumers experience an increase in their purchasing power, allowing them to buy more of the good with the same income.
2.  **The Substitution Effect**: When the price of a good drops, it becomes relatively cheaper compared to other goods, leading consumers to substitute away from expensive items toward the cheaper one.

### Demand Shifters (Non-Price Factors):
A change in price causes a movement *along* the demand curve (change in quantity demanded). Non-price factors, however, shift the *entire* demand curve left or right:
1.  **Income**:
    * *Normal Goods*: Demand $\\uparrow$ as consumer income increases (e.g., organic food, travel).
    * *Inferior Goods*: Demand $\\downarrow$ as consumer income increases (e.g., instant noodles, public transit).
2.  **Tastes & Preferences**: Cultural trends, advertising campaigns, health studies, or seasonal changes shift consumer preferences.
3.  **Prices of Related Goods**:
    * *Substitutes*: Goods used in place of one another. An increase in the price of beef leads to an increase in the demand for chicken.
    * *Complements*: Goods used together. An increase in the price of printer ink leads to a decrease in the demand for printers.
4.  **Expectations**: If consumers expect future price rises or supply shortages, current demand shifts right.
5.  **Number of Buyers**: An increase in population or demographic changes increases aggregate market demand.

---

## 2. The Law of Supply
The Law of Supply states that, ceteris paribus, there is a **direct relationship** between the price of a good and the quantity supplied by producers. Higher prices incentivize firms to produce more, seeking higher profits.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200" alt="Manufacturing Factory" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 2: Modern manufacturing plant showing supply capacity</p>
</div>

* **As Price ($P$) $\\uparrow$, Quantity Supplied ($Q_S$) $\\uparrow$**
* **As Price ($P$) $\\downarrow$, Quantity Supplied ($Q_S$) $\\downarrow$**

### Supply Shifters (Non-Price Factors):
While price changes cause movements *along* the supply curve, other variables shift the entire supply curve:
* **Input Prices**: If the cost of raw materials (e.g., steel, labor) rises, production becomes less profitable, and supply shifts left.
* **Technology**: Advances in manufacturing technology increase productivity, reducing costs and shifting the supply curve right.
* **Number of Sellers**: More sellers entering the market increases aggregate supply, shifting the curve right.
* **Taxes & Subsidies**: Government taxes shift supply left, while subsidies reduce costs and shift supply right.
* **Expectations**: Anticipations of future price rises might cause firms to temporarily hoard stock, shifting current supply left.

---

## 3. Market Equilibrium
Market equilibrium occurs at the intersection of the supply and demand curves. At this point, the market clears perfectly: the quantity demanded by buyers matches the quantity supplied by sellers.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200" alt="Financial Charts" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 3: Price indicators reflecting supply/demand equilibrium</p>
</div>

The price at this point is called the **equilibrium price** ($P^*$), and the quantity is the **equilibrium quantity** ($Q^*$).

### Mathematical Representation:
Consider a simple market with the following supply and demand equations:
$$Q_D = 120 - 4P$$
$$Q_S = 20 + 6P$$

To find the equilibrium price ($P^*$), we set quantity demanded equal to quantity supplied ($Q_D = Q_S$):
$$120 - 4P = 20 + 6P$$
$$100 = 10P \\implies P^* = 10$$

Now, we substitute $P^* = 10$ back into either equation to solve for the equilibrium quantity ($Q^*$):
$$Q^* = 120 - 4(10) = 80$$
$$Q^* = 20 + 6(10) = 80$$

> 💡 **Key Takeaway:** At $P^* = 10$, the market clears perfectly with $Q^* = 80$. If the price were set above 10, a **surplus** would occur ($Q_S > Q_D$). If it were set below 10, a **shortage** would occur ($Q_D > Q_S$).

---

## 4. Price Elasticity of Demand (PED)
Price Elasticity of Demand measures how responsive the quantity demanded of a good is to a change in its price.

### Mathematical Formula:
$$E_D = \\frac{\\% \\Delta Q_D}{\\% \\Delta P}$$

Using the mid-point method, we can classify elasticity into three main categories:
1.  **Elastic Demand ($|E_D| > 1$)**: Quantity demanded is highly responsive to price changes (e.g., luxury goods, brands with close substitutes). A price increase leads to a drop in total revenue.
2.  **Inelastic Demand ($|E_D| < 1$)**: Quantity demanded is relatively unresponsive to price changes (e.g., lifesaving medicine, electricity, gasoline). A price increase leads to an increase in total revenue.
3.  **Unitary Elastic Demand ($|E_D| = 1$)**: Percentage change in quantity equals the percentage change in price. Total revenue remains unchanged.
`
  },
  "notes-stanford-cs229-ml-jgwo_ugts7i": {
    _id: "mock-note-neural",
    title: "Stanford CS229: Machine Learning - Lecture 10: Neural Networks",
    videoUrl: "https://youtu.be/jGwO_UgTS7I",
    thumbnail: "https://img.youtube.com/vi/jGwO_UgTS7I/maxresdefault.jpg",
    generationDetails: { format: "notes", theme: "minimalist" },
    messages: [
      {
        _id: "neural-m1",
        role: "assistant",
        content: "Hello! I am PaperChat, your CS229 assistant. Let's delve into neural network layers, activation functions, forward propagation matrix math, or backpropagation updates!",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: "neural-m2",
        role: "user",
        content: "Why do we need non-linear activations in hidden layers?",
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        _id: "neural-m3",
        role: "assistant",
        content: "If we don't apply non-linear activation functions (like ReLU or Sigmoid) between layers, the network collapses into a single linear model. Mathematically, a composition of linear transformations is just a linear transformation:\n\n$$W_2(W_1 X + b_1) + b_2 = (W_2 W_1) X + (W_2 b_1 + b_2) = W_{combined} X + b_{combined}$$\n\nWithout non-linear activations, adding hidden layers does not increase the representational power of the model. Non-linearities allow the network to approximate complex decision boundaries.",
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
      }
    ],
    content: `# Stanford CS229: Machine Learning - Lecture 10: Neural Networks

## 📌 Executive Summary
This lecture bridges the gap between simple linear models (like Logistic Regression) and deep learning. By stacking layers of parameterized units, Neural Networks can learn complex, non-linear representations of data. This document outlines the fundamental architecture, forward propagation mathematics, common activation functions, and the backpropagation algorithm.

---

## 1. From Linear Models to Neural Networks
Logistic regression is limited to learning linear decision boundaries. A neural network overcomes this by chaining multiple layers together. The output of one layer becomes the input features for the next layer.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1200" alt="Code and Neural Networks" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 1: AI models compute complex abstractions across thousands of nodes</p>
</div>

### Architecture Definitions:
* **Input Layer**: Passes raw features $X$ into the network. Not counted as a formal "layer" when calculating network depth.
* **Hidden Layers**: Intermediate layers where the network learns abstract representations. They are "hidden" because their true values are not observed in the training set.
* **Output Layer**: Produces the final prediction $\hat{y}$.

---

## 2. Activation Functions
Activation functions introduce non-linearities into the network. Without them, no matter how deep the network is, it would mathematically simplify down to a single linear transformation.

1.  **Sigmoid**: Squashes numbers between 0 and 1. Rarely used in hidden layers today due to the *vanishing gradient problem*, but still used in the output layer for binary classification.
    * $g(z) = \frac{1}{1 + e^{-z}}$
2.  **Tanh (Hyperbolic Tangent)**: Squashes numbers between -1 and 1. Often performs better than sigmoid because the activations are zero-centered.
    * $g(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}$
3.  **ReLU (Rectified Linear Unit)**: The default activation for modern hidden layers. It is computationally efficient and mitigates vanishing gradients for positive inputs.
    * $g(z) = \max(0, z)$

---

## 3. Forward Propagation Math
Forward propagation computes the output of the network given input $X$. For a single training example, let $a^{[l]}$ represent the activations of layer $l$.

### Vectorized Equations for Layer $l$:
$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = g(z^{[l]})$$

Where:
* $W^{[l]}$: Weight matrix of shape $(\text{units}_{l}, \text{units}_{l-1})$
* $b^{[l]}$: Bias vector of shape $(\text{units}_{l}, 1)$
* $a^{[0]}$ is the input $X$.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200" alt="Mathematics on a Chalkboard" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 2: Matrix multiplication forms the computational core of forward propagation</p>
</div>

---

## 4. Cost Function & Backpropagation
To train the neural network, we define a loss function and minimize it using Gradient Descent. For binary classification, we use the Cross-Entropy loss.

### Cost Function:
$$J(W, b) = -\frac{1}{m} \sum_{i=1}^{m} \left[ y^{(i)} \log(\hat{y}^{(i)}) + (1 - y^{(i)}) \log(1 - \hat{y}^{(i)}) \right]$$

### Backpropagation Algorithm
Backpropagation uses the **chain rule of calculus** to compute the gradient of the loss function with respect to every weight and bias in the network. We compute errors moving backwards from the output layer to the input.

**Step 1: Compute output error ($dZ^{[L]}$)**
$$dZ^{[L]} = A^{[L]} - Y$$

**Step 2: Compute Gradients for Layer $L$**
$$dW^{[L]} = \frac{1}{m} dZ^{[L]} A^{[L-1]T}$$
$$db^{[L]} = \frac{1}{m} \sum dZ^{[L]}$$

**Step 3: Propagate error backward to hidden layers**
$$dZ^{[l]} = (W^{[l+1]T} dZ^{[l+1]}) * g'(Z^{[l]})$$
*(Where $*$ represents element-wise multiplication and $g'$ is the derivative of the activation function).*

**Step 4: Update Parameters via Gradient Descent**
$$W^{[l]} := W^{[l]} - \alpha \cdot dW^{[l]}$$
$$b^{[l]} := b^{[l]} - \alpha \cdot db^{[l]}$$
*(Where $\alpha$ is the learning rate).*`
  },
  "notes-biology-cell-structure-urujd5nexc8": {
    _id: "mock-note-cell",
    title: "Biology: Cell Structure (Plant & Animal Cells)",
    videoUrl: "https://youtu.be/URUJD5NEXC8",
    thumbnail: "https://img.youtube.com/vi/URUJD5NEXC8/maxresdefault.jpg",
    generationDetails: { format: "notes", theme: "ocean" },
    messages: [
      {
        _id: "cell-m1",
        role: "assistant",
        content: "Hi! I am PaperChat, your biology assistant. Ask me anything about animal vs plant cell organelles, DNA replication sites, or membrane functions!",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: "cell-m2",
        role: "user",
        content: "How does the plant cell wall differ in function from the cell membrane?",
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        _id: "cell-m3",
        role: "assistant",
        content: "The **cell wall** is a rigid outer layer found only in plants, fungi, and bacteria. It is composed of cellulose (in plants) and provides structural strength, protection, and prevents the cell from bursting when water enters.\n\nThe **cell membrane** (plasma membrane) is flexible, semi-permeable, and found in *all* cells. It regulates what enters and exits the cell (homeostasis) using transport proteins, acting as a dynamic gatekeeper rather than a rigid structural support.",
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
      }
    ],
    content: `# Biology: Cell Structure (Plant & Animal Cells)

## 📌 Executive Summary
Cells are the basic structural and functional units of all living organisms. This guide outlines the key structural components of eukaryotic cells, detailing the specific organelles found in both animal and plant cells, their physiological roles, and how they transport materials.

---

## 1. Eukaryotic Organelles & Their Functions
Eukaryotic cells are defined by the presence of a membrane-bound nucleus and specialized membrane-bound compartments called **organelles**.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1200" alt="Microscopic Cells" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 1: Microscopic visualization of eukaryotic cell structures</p>
</div>

### The Endomembrane System:
This system works together to synthesize, modify, package, and transport lipids and proteins.
1.  **Nucleus**: Houses the cell's genomic DNA. Surrounded by a double-membrane nuclear envelope with pores that allow mRNA to exit.
2.  **Endoplasmic Reticulum (ER)**:
    * *Rough ER*: Studded with ribosomes. It folds and modifies newly synthesized proteins destined for secretion or the membrane.
    * *Smooth ER*: Lacks ribosomes. Crucial for lipid synthesis, carbohydrate metabolism, and detoxification of drugs and poisons.
3.  **Golgi Apparatus**: The "post office" of the cell. It receives transport vesicles from the ER, modifies the proteins/lipids, and ships them to their final destinations.
4.  **Lysosomes**: Membranous sacs containing hydrolytic enzymes that digest macromolecules and recycle old cell parts (autophagy).

### Energy Production Organelles:
* **Mitochondria**: The site of cellular respiration. They generate ATP by extracting energy from sugars and fats using oxygen.
* **Chloroplasts** *(Plants only)*: The site of photosynthesis. They convert solar energy into chemical energy (glucose).

---

## 2. Plant vs. Animal Cells
While sharing most organelles, plant and animal cells have evolved distinct differences to support their respective life strategies.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200" alt="Plant Leaves" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 2: Plant cells utilize chloroplasts and rigid cell walls for structure and energy</p>
</div>

| Feature | Animal Cells | Plant Cells |
| :--- | :--- | :--- |
| **Cell Wall** | Absent | Present (made of cellulose; provides rigid support) |
| **Chloroplasts** | Absent | Present (contains chlorophyll for photosynthesis) |
| **Vacuoles** | Small, multiple temporary vacuoles | One large central vacuole (maintains turgor pressure) |
| **Centrioles** | Present (used in cell division) | Absent in most higher plants |
| **Shape** | Irregular / round and flexible | Fixed / geometric and rigid |

---

## 3. Cell Membrane: Fluid Mosaic Model
The cell membrane (plasma membrane) is composed of a **phospholipid bilayer** with embedded proteins, cholesterol, and carbohydrates.

* **Phospholipids**: Have a hydrophilic (water-loving) phosphate head facing outward, and two hydrophobic (water-fearing) fatty acid tails facing inward.
* **Selective Permeability**: Small, non-polar molecules (like $O_2$ and $CO_2$) can diffuse straight through the lipid bilayer. Large or charged molecules (like glucose or $Na^+$ ions) cannot pass without help.

### Mechanisms of Cellular Transport
1.  **Passive Transport** (No ATP required; moves from High $\\rightarrow$ Low concentration):
    * *Simple Diffusion*: Direct movement across the lipid bilayer.
    * *Facilitated Diffusion*: Movement via specific integral transport proteins (channels or carriers).
    * *Osmosis*: The diffusion of free water molecules across a selectively permeable membrane.
2.  **Active Transport** (Requires ATP; moves from Low $\\rightarrow$ High concentration):
    * Uses protein "pumps" (e.g., the Sodium-Potassium pump) to move substances against their concentration gradient.
    * *Endocytosis/Exocytosis*: Bulk transport using vesicles.`
  },
  "notes-something-finally-broke-between-us-and-europe-wydd0rf66de": {
    _id: "mock-note-europe",
    title: "Something Finally Broke Between the U.S. and Europe",
    videoUrl: "https://youtu.be/WYDD0RF66DE",
    thumbnail: "https://img.youtube.com/vi/WYDD0RF66DE/maxresdefault.jpg",
    generationDetails: { format: "notes", theme: "minimalist" },
    messages: [
      {
        _id: "europe-m1",
        role: "assistant",
        content: "Hi! I am PaperChat, ready to help you analyze transatlantic relations, NATO burden-sharing, or the shifting geopolitics between the US and Europe. Ask away!",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: "europe-m2",
        role: "user",
        content: "What is European strategic autonomy and why is it a major topic now?",
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        _id: "europe-m3",
        role: "assistant",
        content: "European **strategic autonomy** is the ability of Europe/EU to defend itself and make geopolitical decisions independently of other superpowers, particularly the United States. \n\nIt is critical now because of:\n1. **U.S. Political Volatility**: Fear of shifting commitment (e.g. neo-isolationist policies or critical remarks about NATO components).\n2. **Security Crisis in Eastern Europe**: The Russia-Ukraine war has forced Europe to realize it cannot rely solely on the US security umbrella for regional defense.",
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
      }
    ],
    content: `# Something Finally Broke Between the U.S. and Europe

## 📌 Executive Summary
This note covers a geopolitical discussion with Max Bergmann (CSIS Europe Director) analyzing the shifting relationship between the United States and Europe. The postwar security alignment is experiencing immense pressure due to changing US domestic politics, shifting global priorities toward Asia, and emerging hot-wars in Eastern Europe.

---

## 1. The Post-WWII Security Architecture
Since 1949, NATO (North Atlantic Treaty Organization) has been the bedrock of European security. The implicit agreement was straightforward: European nations integrated their economies and rebuilt post-WWII under the protective umbrella of the United States military and its nuclear deterrence.

### The Rise of Structural Dependency:
Over decades, this created a massive imbalance. European nations, assured of US protection, reallocated defense budgets into expansive domestic social programs. As a result, European militaries became structurally dependent on the U.S. for:
* Heavy strategic airlift and logistics.
* Advanced satellite and signals intelligence.
* High-volume ammunition manufacturing capabilities.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1528644499245-c143bc354c03?q=80&w=1200" alt="US Capitol and EU Flags" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 1: The political bridge between Washington and Brussels is undergoing a stress test</p>
</div>

---

## 2. The Cracks in the Transatlantic Alliance
Several core issues have catalyzed the current rift between the U.S. and Europe.

1.  **The Burden-Sharing Conflict (The 2% Rule)**
    At the 2014 Wales Summit, NATO allies pledged to spend a minimum of 2% of their GDP on defense by 2024. For years, major powers like Germany consistently fell short, leading to severe public frustration from successive US administrations. U.S. policymakers increasingly view European allies as "free-riders" on American taxpayer-funded security.
2.  **U.S. Domestic Political Volatility**
    The rise of "America First" rhetoric has introduced unpredictability into the alliance. European leaders can no longer guarantee that future US administrations will adhere strictly to Article 5 (collective defense) if a crisis occurs.
3.  **The Pivot to Asia**
    Washington views China as its primary long-term strategic rival. The U.S. military is actively reallocating resources away from Europe and the Middle East toward the Indo-Pacific theater. The U.S. message to Europe is clear: *You must handle your own neighborhood.*

---

## 3. The Drive Toward European "Strategic Autonomy"
In response to the Russian invasion of Ukraine and the realization of U.S. political volatility, the European Union is attempting a massive consolidation of its defense mechanisms.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1590424744257-f1165bc6719e?q=80&w=1200" alt="Military Equipment" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 2: Europe's defense industrial base is struggling to ramp up production to wartime levels</p>
</div>

### Key Initiatives:
* **Zeitenwende (Turning Point)**: Germany's historic pledge to inject €100 billion into modernizing the Bundeswehr, fundamentally altering its post-WWII pacifist stance.
* **Industrial Integration**: The EU is trying to harmonize defense procurement. Historically, the EU operates 17 different types of main battle tanks (compared to the US operating just 1). This fragmentation creates logistical nightmares that the EU is striving to solve through joint-purchasing programs.
* **The Eastern Flank**: Power is shifting eastward. Nations like Poland and the Baltic States are heavily militarizing, with Poland aiming to spend over 4% of its GDP on defense, building one of the largest land armies in Europe.

> 💡 **Key Takeaway:** While Europe has the financial capital to build "strategic autonomy," decoupling from US intelligence and command infrastructure will take decades of sustained investment. The alliance isn't breaking entirely, but it is fundamentally transforming from a parent-child dynamic to a necessary partnership of equals.`
  },
  "notes-mit-804-quantum-physics-lz3bpuko5zc": {
    _id: "mock-note-quantum",
    title: "MIT 8.04 Quantum Physics I: Lecture 1 - Introduction to Superposition",
    videoUrl: "https://youtu.be/lZ3bPUKo5zc",
    thumbnail: "https://img.youtube.com/vi/lZ3bPUKo5zc/maxresdefault.jpg",
    generationDetails: { format: "notes", theme: "atmosphere" },
    messages: [
      {
        _id: "quantum-m1",
        role: "assistant",
        content: "Welcome! I am PaperChat, your quantum mechanics assistant. Ask me anything about superposition kets, the box experiment setup, or the mathematical framework of quantum measurements!",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: "quantum-m2",
        role: "user",
        content: "Can you explain the Box Apparatus experiment mentioned in the lecture?",
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        _id: "quantum-m3",
        role: "assistant",
        content: "The **Box Apparatus** is a thought experiment used by Prof. Allan Adams to demonstrate superposition. \n\nConsider boxes that measure either **Color** (Black vs. White) or **Hardness** (Hard vs. Soft) of electrons:\n\n1. Feed white electrons into a Hardness box: they split 50/50 into Hard and Soft.\n2. Take the output 'Hard' electrons (which we expect to be 100% white) and feed them into a Color box: they split 50/50 into White and Black!\n\nThis shows that measuring Hardness physically disrupted/destroyed the definite Color state, proving the electron did not have a pre-existing color value. It was in a **superposition** of states until measured.",
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString()
      }
    ],
    content: `# MIT 8.04 Quantum Physics I: Lecture 1 - Introduction to Superposition

## 📌 Executive Summary
Lecture 1 introduces Quantum Mechanics as a radical departure from classical determinism. Through the Box Apparatus thought experiment, Prof. Allan Adams explains that quantum particles do not possess definite values for physical observables until they are forced into a state via measurement. Instead, they exist in linear combinations of states called **superpositions**.

---

## 1. The Failure of Classical Determinism
In Classical Mechanics (Newtonian physics), the universe is deterministic. If you know the initial position, velocity, and forces acting on a particle, you can predict its exact trajectory forever.
* A classical object has definite physical properties (e.g., location, momentum, color) independent of observation.
* Measurement simply reveals what was already there without inherently changing the system.

In **Quantum Mechanics**, this breaks down. The state of a system is described not by definite values, but by a probability wave (wave function). The act of measurement is an active intervention that forces the system to "collapse" into one specific state.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1200" alt="Abstract Quantum Physics" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 1: Particles exist in a cloud of probabilities until a measurement collapses the wave function</p>
</div>

---

## 2. The Box Experiment Apparatus
To bypass complex calculus initially, Prof. Adams introduces a highly intuitive thought experiment involving "boxes" that measure specific properties of electrons.

Assume electrons have two measurable properties:
1.  **Color**: Measured by a Color Box ($C$), outputs White ($W$) or Black ($B$).
2.  **Hardness**: Measured by a Hardness Box ($H$), outputs Hard ($H$) or Soft ($S$).

### The Paradox of Consecutive Measurements
1.  **Step 1:** Feed a beam of electrons into a $C$-box. Discard the Black ones. You now have a beam of 100% White electrons.
2.  **Step 2:** Feed those White electrons into an $H$-box. They split randomly: 50% Hard and 50% Soft.
3.  **Step 3:** Take the 50% that are Hard, and feed them *back* into a $C$-box.

*Classical expectation*: Since we isolated White electrons in Step 1, these Hard electrons should all be White.
*Quantum reality*: The electrons split $50/50$ into White and Black!

$$\\text{White} \\xrightarrow{H-box} 50\\% \\text{ Hard} \\xrightarrow{C-box} 50\\% \\text{ White } + 50\\% \\text{ Black}$$

> 💡 **Key Takeaway:** The measurement of Hardness physically destroys the previous information about the electron's Color. While the electron was in the definite $H$ state, it lacked a definite Color. It was in a **superposition** of White and Black.

---

## 3. The Mathematics of Superposition
Quantum states are represented as vectors in a complex Hilbert space using **Dirac Bra-Ket Notation**. The state of our particle is denoted by a "ket": $|\\psi\\rangle$.

<div style="text-align:center;margin:20px 0">
  <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200" alt="Physics Equations" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig 2: Quantum mechanics relies on complex linear algebra rather than standard calculus</p>
</div>

### Linear Combinations:
If an electron is in the Hard state $|H\\rangle$, we can mathematically express this as a superposition of the color basis states:
$$|H\\rangle = \\frac{1}{\\sqrt{2}}|W\\rangle + \\frac{1}{\\sqrt{2}}|B\\rangle$$

More generally, a generic quantum state $|\\psi\\rangle$ is written as:
$$|\\psi\\rangle = \\alpha |W\\rangle + \\beta |B\\rangle$$

* $\\alpha$ and $\\beta$ are **probability amplitudes** (complex numbers).
* **The Born Rule**: The probability of measuring the state $|W\\rangle$ is proportional to the square of its amplitude: $P(\\text{White}) = |\\alpha|^2$.
* Because probabilities must sum to 1, the state vector must be normalized: 
    $$|\\alpha|^2 + |\\beta|^2 = 1$$

This mathematical framework explains why measuring one property scrambles the other, enforcing the rules of the Heisenberg Uncertainty Principle.`
  }
};