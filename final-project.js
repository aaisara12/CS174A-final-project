import {defs, tiny} from './examples/common.js';
import {model_defs} from './model-defs.js';


// Components
import {GameObject, Transform} from './gameobject.js';
import {components} from './component.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        this.hover = this.swarm = false;

        // audio
        this.bgm = new Audio();
        this.bgm.src = 'assets/battle.mp3';
        this.bgm.volume = 0.2;
        this.arrow_shot = new Audio();
        this.arrow_shot.src = 'assets/bow_shoot.mp3';
        this.hit = new Audio();
        this.hit.src = 'assets/hitmarker.mp3';
        this.badhit = new Audio();
        this.badhit.src = 'assets/oof.mp3';
        this.victory = new Audio();
        this.victory.src = 'assets/victory!.mp3';
        this.fail = new Audio();
        this.fail.src = 'assets/fail.mp3';
        this.fireworks = new Audio();
        this.fireworks.src = 'assets/fireworks.mp3';
        this.charge = new Audio();
        this.charge.src = 'assets/charge.mp3';
        this.shapes = {
            'sky': new defs.Subdivision_Sphere(4),
            'ground': new defs.Cube(),
            'sun': new defs.Subdivision_Sphere(4), // declare shapes
            'bow': new model_defs.Bow(),
			'drawn_bow': new model_defs.Drawn_Bow(),
            'arrow': new model_defs.Arrow(),
            'target': new model_defs.Target(),
            'board': new model_defs.Board(),
            'cube': new defs.Cube(),
            'outline':new model_defs.Cube_Outline(),
            'square': new defs.Square(),
            'fire': new model_defs.Emitter(),
            'fire_particle': new model_defs.Particle(),
            'axis': new defs.Axis_Arrows(),
        };

        // *** Materials
        this.materials = {
            sun: new Material(new defs.Phong_Shader(), // declare materials
                {ambient: 1.0}),
            arrow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#deb887')}),
            bow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#fff8dc')}),
            target: new Material(new model_defs.Target_Shader(),
                {ambient: .3, diffusivity: .8, specularity: 0.7}),
            board: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#fff8dc')}),
            sky_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/sky.png", "LINEAR_MIPMAP_LINEAR")
            }),
            night_sky_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .5, diffusivity: 0.9, specularity: 0.1,
                texture: new Texture("assets/starry.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            ground: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            fire_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .5, diffusivity: 1, specularity: 1,
                texture: new Texture("assets/Fire.gif", "LINEAR_MIPMAP_LINEAR")
            }),
            archer: new Material(new defs.Phong_Shader(),
                {ambient: 1.0, diffusivity: .8, color: hex_color("#f7b96d")}),

            bar_g: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, specularity: 1.0, color: hex_color('#00ff00')}),
            bar_y: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, specularity: 1.0, color: hex_color('#ffff00')}),
            bar_r: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, specularity: 1.0, color: hex_color('#ff0000')}),
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, specularity: 1.0, color: hex_color("#ffffff")}),
            score0: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/0.png","NEAREST")
            }),
            score1: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/1.png","NEAREST")
            }),
            score2: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/2.png","NEAREST")
            }),
            score3: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/3.png","NEAREST")
            }),
            score4: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/4.png","NEAREST")
            }),
            score5: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/5.png","NEAREST")
            }),
            score6: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/6.png","NEAREST")
            }),
            score7: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/7.png","NEAREST")
            }),
            score8: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/8.png","NEAREST")
            }),
            score9: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/9.png","NEAREST")
            }),
            score10: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/10.png","NEAREST")
            }),
            
        };
        
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
	    this.attached = 0; //initial camera value
        this.cam = "Yes"; //free cam or no 
        this.arrow_power=0;
        this.pulled = false;

        // sky bool
        this.sky = true;
        this.sun_coef = Math.PI * (0.03);

        // particle array
        this.particles = new Array();
        for(let i = 0; i < 30; i++) {
            this.particles.push(new model_defs.Particle(Mat4.identity(), 0.0, false));
        }

        this.burning = {
            'on': false,
            'transform': Mat4.identity()
        }
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 1000);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}
const Controls = defs.Movement_Controls =
    class Controls extends Scene {
        // **Movement_Controls** is a Scene that can be attached to a canvas, like any other
        // Scene, but it is a Secondary Scene Component -- meant to stack alongside other
        // scenes.  Rather than drawing anything it embeds both first-person and third-
        // person style controls into the website.  These can be used to manually move your
        // camera or other objects smoothly through your scene using key, mouse, and HTML
        // button controls to help you explore what's in it.
        constructor() {
            super();
            const data_members = {
                roll: 0, look_around_locked: true,
                thrust: vec3(0, 0, 0), pos: vec3(0, 0, 0), z_axis: vec3(0, 0, 0),
                radians_per_frame: 1 / 200, meters_per_frame: 20, speed_multiplier: 1
            };
            Object.assign(this, data_members);

            this.mouse_enabled_canvases = new Set();
            this.will_take_over_graphics_state = true;
        }

        set_recipient(matrix_closure, inverse_closure) {
            // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
            // instead, track an external target matrix to modify.  Targets must be pointer references
            // made using closures.
            this.matrix = matrix_closure;
            this.inverse = inverse_closure;
        }

        reset(graphics_state) {
            // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
            // encountered program_state object.  Targets must be pointer references made using closures.
            this.set_recipient(() => graphics_state.camera_transform,
                () => graphics_state.camera_inverse);
        }

        add_mouse_controls(canvas) {
            // add_mouse_controls():  Attach HTML mouse events to the drawing canvas.
            // First, measure mouse steering, for rotating the flyaround camera:
            this.mouse = {"from_center": vec(0, 0)};
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec(e.clientX - (rect.left + rect.right) / 2, e.clientY - (rect.bottom + rect.top) / 2);
            // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas:
            document.addEventListener("mouseup", e => {
                this.mouse.anchor = undefined;
            });
            canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                this.mouse.anchor = mouse_position(e);
            });
            canvas.addEventListener("mousemove", e => {
                e.preventDefault();
                this.mouse.from_center = mouse_position(e);
            });
            canvas.addEventListener("mouseout", e => {
                if (!this.mouse.anchor) this.mouse.from_center.scale_by(0)
            });
        }

        show_explanation(document_element) {
        }

       make_control_panel() {
            // make_control_panel(): Sets up a panel of interactive HTML elements, including
            // buttons with key bindings for affecting this scene, and live info readouts.
            this.control_panel.innerHTML += "Click and drag the scene to spin your viewpoint around it.<br>";
            this.live_string(box => box.textContent = "- Position: " + this.pos[0].toFixed(2) + ", " + this.pos[1].toFixed(2)
                + ", " + this.pos[2].toFixed(2));
            this.new_line();
            // The facing directions are surprisingly affected by the left hand rule:
            this.live_string(box => box.textContent = "- Facing: " + ((this.z_axis[0] > 0 ? "West " : "East ")
                + (this.z_axis[1] > 0 ? "Down " : "Up ") + (this.z_axis[2] > 0 ? "North" : "South")));
            //this.new_line();
            //this.new_line();
            this.new_line();
            const dir = this.control_panel.appendChild(document.createElement("span"));
            dir.style.margin = "37px";
            this.key_triggered_button("Up", ["w"], () => this.thrust[1] = -1, "#77d777", () => this.thrust[1] = 0);
            this.new_line();
            //this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);a
            this.key_triggered_button("Left", ["a"], () => this.thrust[0] = 1,  "#77d777", () => this.thrust[0] = 0);
            //this.key_triggered_button("Back", ["s"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
            this.key_triggered_button("Down", ["s"], () => this.thrust[1] = 1,  "#77d777", () => this.thrust[1] = 0);
            this.key_triggered_button("Right", ["d"], () => this.thrust[0] = -1,  "#77d777", () => this.thrust[0] = 0);
            this.new_line();
            this.key_triggered_button("Back", ["q"], () => this.thrust[2] = -1, "#77d777", () => this.thrust[2] = 0);
             this.key_triggered_button("Forward", ["e"], () => this.thrust[2] = 1, "#77d777", () => this.thrust[2] = 0);
            this.new_line();
            this.new_line();
            /*const speed_controls = this.control_panel.appendChild(document.createElement("span"));
            //speed_controls.style.margin = "30px";
            this.key_triggered_button("-", ["z"], () =>
                this.speed_multiplier /= 1.2, "#add8e6", undefined, undefined, speed_controls);
            this.live_string(box => {
                box.textContent = "Arrow Power: " + this.speed_multiplier.toFixed(2)
            }, speed_controls);
            this.key_triggered_button("+", ["x"], () =>
                this.speed_multiplier *= 1.2, "#0800f6", undefined, undefined, speed_controls);
                this.new_line();
            const speed_controls2 = this.control_panel.appendChild(document.createElement("span"));
            speed_controls2.style.margin = "5px";
            this.key_triggered_button("Reset Arrow Power:", [" "], () => {
                this.speed_multiplier = 1;
            }, "#ff7f7f");*/
            //this.key_triggered_button("Roll left", [","], () => this.roll = 1, undefined, () => this.roll = 0);
            //this.key_triggered_button("Roll right", ["."], () => this.roll = -1, undefined, () => this.roll = 0);
            this.new_line();
            this.key_triggered_button("(Un)freeze mouse look around", ["f"], () => this.look_around_locked ^= 1, "#8B8885");
            this.new_line();
            /*this.key_triggered_button("Go to world origin", ["r"], () => {
                this.matrix().set_identity(4, 4);
                this.inverse().set_identity(4, 4)
            }, "#8B8885");*/
            this.new_line();

            this.key_triggered_button("Reset position", ["r"], () => {
                this.inverse().set(Mat4.look_at(vec3(0, 0, 30), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.new_line();
            /*this.key_triggered_button("from right", ["2"], () => {
                this.inverse().set(Mat4.look_at(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.key_triggered_button("from rear", ["3"], () => {
                this.inverse().set(Mat4.look_at(vec3(0, 0, -10), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.key_triggered_button("from left", ["4"], () => {
                this.inverse().set(Mat4.look_at(vec3(-10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.new_line();*/
            /*this.key_triggered_button("Attach to global camera", ["Shift", "R"],
                () => {
                    this.will_take_over_graphics_state = true
                }, "#8B8885");*/
            this.new_line();
        }

        first_person_flyaround(radians_per_frame, meters_per_frame, leeway = 70) {
            // (Internal helper function)
            // Compare mouse's location to all four corners of a dead box:
            const offsets_from_dead_box = {
                plus: [this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway],
                minus: [this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway]
            };
            // Apply a camera rotation movement, but only when the mouse is
            // past a minimum distance (leeway) from the canvas's center:
            if (!this.look_around_locked)
                // If steering, steer according to "mouse_from_center" vector, but don't
                // start increasing until outside a leeway window from the center.
                for (let i = 0; i < 2; i++) {                                     // The &&'s in the next line might zero the vectors out:
                    let o = offsets_from_dead_box,
                        velocity = ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) * radians_per_frame;
                    // On X step, rotate around Y axis, and vice versa.
                    this.matrix().post_multiply(Mat4.rotation(-velocity, i, 1 - i, 0));
                    this.inverse().pre_multiply(Mat4.rotation(+velocity, i, 1 - i, 0));
                }
            this.matrix().post_multiply(Mat4.rotation(-.1 * this.roll, 0, 0, 1));
            this.inverse().pre_multiply(Mat4.rotation(+.1 * this.roll, 0, 0, 1));
            // Now apply translation movement of the camera, in the newest local coordinate frame.
            this.matrix().post_multiply(Mat4.translation(...this.thrust.times(-meters_per_frame)));
            this.inverse().pre_multiply(Mat4.translation(...this.thrust.times(+meters_per_frame)));
        }

        third_person_arcball(radians_per_frame) {
            // (Internal helper function)
            // Spin the scene around a point on an axis determined by user mouse drag:
            const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);
            if (dragging_vector.norm() <= 0)
                return;
            this.matrix().post_multiply(Mat4.translation(0, 0, -25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, +25));

            const rotation = Mat4.rotation(radians_per_frame * dragging_vector.norm(),
                dragging_vector[1], dragging_vector[0], 0);
            this.matrix().post_multiply(rotation);
            this.inverse().pre_multiply(rotation);

            this.matrix().post_multiply(Mat4.translation(0, 0, +25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, -25));
        }

        display(context, graphics_state, dt = graphics_state.animation_delta_time / 1000) {
            // The whole process of acting upon controls begins here.
            const m = this.speed_multiplier * this.meters_per_frame,
                r = this.speed_multiplier * this.radians_per_frame;

            if (this.will_take_over_graphics_state) {
                this.reset(graphics_state);
                this.will_take_over_graphics_state = false;
            }

            if (!this.mouse_enabled_canvases.has(context.canvas)) {
                this.add_mouse_controls(context.canvas);
                this.mouse_enabled_canvases.add(context.canvas)
            }
            // Move in first-person.  Scale the normal camera aiming speed by dt for smoothness:
            this.first_person_flyaround(dt * r, dt * m);
            // Also apply third-person "arcball" camera mode if a mouse drag is occurring:
            if (this.mouse.anchor)
                this.third_person_arcball(dt * r);
            // Log some values:
            this.pos = this.inverse().times(vec4(0, 0, 0, 1));
            this.z_axis = this.inverse().times(vec4(0, 0, 1, 0));
        }
    }


export class FinalProject extends Base_Scene {

    constructor()
    {
        super();
        
        this.gameobjects = [];                               // List of GameObjects in scene       
        this.pow_multiplier = 1;
        this.score =0;
        // Special GameObjects that require specific reference
        this.bow;
        this.pitch_joint;
        this.yaw_joint;
        this.archer_fps_cam;
        this.target_transform;
        this.target_moved = false;
        this.windForce = vec3(1, -2, 3);
    }

    // Make a special function that spawns in a GameObject into the scene (instantiates a GameObject using a "prefab")
    spawn_gameObject(model, start_transform, components, material)
    {
        let spawnedGO = new GameObject(model, start_transform, components, material);
        this.gameobjects.push(spawnedGO);
        return spawnedGO;
    }

    shoot_arrow(shoot_direction_transform, power)
    {
        let arrow = this.spawn_gameObject(this.shapes.arrow, shoot_direction_transform.model_transform, [new components.Projectile(power, vec3(0, 0, 0))], this.materials.arrow);
        this.target_moved = false;
    }

    shoot_fire_arrow(shoot_direction_transform, power)
    {
        let arrow = this.spawn_gameObject(this.shapes.arrow, shoot_direction_transform.model_transform, [new components.Projectile(power, vec3(0, 0, 0))], this.materials.arrow);
        this.target_moved = false;
    }
    
    powerAdj() {
        this.pow_multiplier += 5;
        if (this.pow_multiplier > 100){
                this.pow_multiplier = 100;
            } 
    }
    
    
    // Spawn in the archer's joints
    initializeArcher()
    {
        // These are the "joints" about which the player can rotate 
        this.yaw_joint = new Transform(Mat4.translation(0, 0, -10)); 
        this.pitch_joint = new Transform(Mat4.translation(0, 0, -10)); 

        // This is the actual bow that we see on screen
        this.bow = this.spawn_gameObject(this.shapes.bow, Mat4.translation(12, 0, -15), [], this.materials.bow);

        // This is the "camera" (defines where the camera should be positioned)
        this.archer_fps_cam = new Transform(this.pitch_joint.model_transform); 
        // Point/Position the camera so that it looks down the direction of the bow
        this.archer_fps_cam.translate(-20, 0, 0);     
        this.archer_fps_cam.rotate(0, -2*Math.PI/4, 0);


        this.yaw_joint.addChild(this.pitch_joint);
        this.pitch_joint.addChild(this.bow.transform);
        this.pitch_joint.addChild(this.archer_fps_cam);
        
    }
    
    move_target_back(){
        this.target_transform[0][3] += 5;
        this.target_moved = true;
    }

    move_target_closer(){
        this.target_transform[0][3] -= 5;
        this.target_moved = true;
    }

    move_target_up(){
        this.target_transform[1][3] += 5;
        this.target_moved = true;
    }

    move_target_down(){
        this.target_transform[1][3] -= 5;
        this.target_moved = true;
    }

    move_target_left(){
        this.target_transform[2][3] -= 5;
        this.target_moved = true;
    }

    move_target_right(){
        this.target_transform[2][3] += 5;
        this.target_moved = true;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.live_string(box => {
                box.textContent = "Wind: "
            });
        this.new_line();
        let y_dir = "Up: ";
        if(this.windForce[1]<0)
            y_dir = "Down: ";
        this.live_string(box => {
                box.textContent = y_dir +Math.abs(this.windForce[1])
            });
        this.new_line();
        let x_dir = "Right: ";
        if(this.windForce[1]<0)
            x_dir = "Left: ";
        this.live_string(box => {
                box.textContent = x_dir + Math.abs(this.windForce[0])
            });
        this.new_line();
        let z_dir = "Backwards: ";
        if(this.windForce[1]<0)
            z_dir = "Forwards: ";
        this.live_string(box => {
                box.textContent = z_dir + Math.abs(this.windForce[2])
            });
        this.new_line();
        this.new_line();
        this.key_triggered_button("Move Target Back", ["1"], () => this.move_target_back());
        this.key_triggered_button("Move Target Closer", ["2"], () => this.move_target_closer());
        this.key_triggered_button("Move Target Up", ["3"], () => this.move_target_up());
        this.key_triggered_button("Move Target Down", ["4"], () => this.move_target_down());
        this.key_triggered_button("Move Target Left", ["5"], () => this.move_target_left());
        this.key_triggered_button("Move Target Right", ["6"], () => this.move_target_right());

        this.key_triggered_button("Aim Left", ["j"], () => this.yaw_joint.rotate(0, Math.PI/30, 0));
        this.key_triggered_button("Aim Up", ["i"], () => this.pitch_joint.rotate(0, 0, Math.PI/30));
        this.key_triggered_button("Aim Down", ["k"], () => this.pitch_joint.rotate(0, 0, -Math.PI/30));
        this.key_triggered_button("Aim Right", ["l"], () => this.yaw_joint.rotate(0, -Math.PI/30, 0));

        this.new_line();
        this.new_line();
    	this.key_triggered_button("Lock First Person", ["t"], () => this.attached = () => 1);
        this.key_triggered_button("Lock Third Person", ["y"], () => this.attached = () => 3);
        this.new_line();
        this.key_triggered_button("Free Cam", ["h"], () => this.attached = () => "f");
        this.live_string(box => box.textContent = "Free Camera View?: " + this.cam);
        this.new_line();
        /*const pow_controls = this.control_panel.appendChild(document.createElement("span"));
            //speed_controls.style.margin = "30px";
            this.key_triggered_button("POWER", ["p"], () => {this.powerAdj(); this.charge.play(); this.pulled = true;}, "#add8e6", undefined, undefined, pow_controls);
            this.live_string(box => {
                box.textContent = "Arrow Power: " + this.pow_multiplier.toFixed(2)
            }, pow_controls);*/
                this.new_line();
        //this.key_triggered_button("SHOOT!", ["Enter"],
        //        () => {this.shoot_arrow(this.bow.transform, this.pow_multiplier.toFixed(2)); this.arrow_shot.play(); this.burning.on = false; this.pulled = false; } , "#ff0000");
        this.key_triggered_button("BGM", ["m"], () => this.bgm.play());
        this.key_triggered_button("SHOOT! FIRE! ARROW!", ["Enter"], () => { this.powerAdj(); this.pulled = true;this.burning.on = true;this.charge.play();} , 
        "#ff0000",() => {this.shoot_fire_arrow(this.bow.transform, this.pow_multiplier); this.fireworks.play(); this.burning.on = true; this.pulled = false;this.pow_multiplier=1;});

    }

    calcDist(a, b){
        return Math.sqrt(Math.pow(a[1][3] - b[1][3], 2) + Math.pow(a[2][3] - b[2][3], 2));
    }
    
    updateGameObject(a, targ, t, dt, recent){
        let radius = 20;
        let distCheck = this.calcDist(a.transform.model_transform, targ) < radius;
        let modelCheck = a.transform.model_transform[0][3] > targ[0][3] && a.transform.model_transform[0][3] < targ[0][3]+5;

        if(modelCheck&&distCheck){
            a.update(0,0);
            if(recent && this.target_moved == false){
                let newscore = this.scoreFinder(a,targ,radius);
                if(newscore != this.score && newscore >= 9)
                    this.victory.play();
                else if (newscore != this.score && newscore <= 4)
                    this.badhit.play();
                else if (newscore != this.score && newscore < 9)
                    this.hit.play();
                this.score=this.scoreFinder(a,targ,radius);
            }
        }
        else{
            a.update(t, dt);
        }
        if(!distCheck&&modelCheck&&recent){ //doesn't hit target, has passed it
            this.score=0;
            this.fail.play();
        }
    }

    scoreFinder(a, targ,radius){
        let pos = this.calcDist(a.transform.model_transform, targ)
        return Math.trunc((radius-pos)/(radius/10)+0.999);
    }
    
    
    display(context, program_state) {
        super.display(context, program_state);
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        // day/night cycle
        let period = (2 * Math.PI) / this.sun_coef;
        if(t % (period) < period/2) {
            this.sky = true;
        }
        else
            this.sky = false;

        // sky
        let sky_transform = Mat4.identity();
        sky_transform = sky_transform.times(Mat4.scale(500, 500, 500));
        if(this.sky)
            this.shapes.sky.draw(context, program_state, sky_transform, this.materials.sky_texture);
        else 
            this.shapes.sky.draw(context, program_state, sky_transform, this.materials.night_sky_texture);

        // ground
        let ground_transform = Mat4.identity();
        ground_transform = ground_transform.times(Mat4.scale(500, 1, 500))
            .times(Mat4.translation(0, -25, 0));
        this.shapes.ground.draw(context, program_state, ground_transform, this.materials.ground);

        if(this.bow == null)
            this.initializeArcher();
        if(!this.pulled)
            this.gameobjects[0].model = this.shapes.bow;
        else
            this.gameobjects[0].model = this.shapes.drawn_bow;
            
        // sun
        let sun_transform = Mat4.identity();
        sun_transform = sun_transform.times(Mat4.rotation(this.sun_coef * t, 1, 0, 0))
               .times(Mat4.translation(0, 0, -250));
        
        let sun_color = vec4(1, 1, 1, 1);
        let sun_material = this.materials.sun;
        sun_material = sun_material.override({color:sun_color});
        if(this.sky) {
            program_state.lights =  [new Light(sun_transform.transposed()[3], color(1, 1, 1, 1), 10 ** 10)];
            this.shapes.sun.draw(context, program_state, sun_transform, sun_material);
        }

        // moon
        let moon_transform = Mat4.identity();
        moon_transform = moon_transform.times(Mat4.rotation(this.sun_coef * t, 1, 0, 0))
               .times(Mat4.translation(0, 0, 250));
        let moon_color = vec4(1, 1, 1, 1);
        let moon_material = this.materials.sun;
        moon_material = moon_material.override({color:moon_color});

        if(!this.sky) {
            program_state.lights =  [new Light(moon_transform.transposed()[3], color(1, 1, 1, 1), 10 ** 3)];
            this.shapes.sun.draw(context, program_state, moon_transform, moon_material);
        }
        
        // particle generation
        if(this.burning.on == true) {
            for(let i = 0; i < 30; i++) {
                if(this.particles[i].init == false) {
                    this.particles[i].init = true;
                    this.particles[i].transformation = this.burning.transform;
                }
                else {
                    if(t > this.particles[i].end_time) {
                        this.particles.splice(i, 1);
                        this.particles.push(new model_defs.Particle(this.burning.transform, t, true))
                    }
                    this.particles[i].transformation = this.particles[i].transformation.times(Mat4.translation(this.particles[i].vel_x * dt, (Math.random() + 3 + 3) * dt, this.particles[i].vel_z * dt));
                    this.shapes.fire_particle.draw(context, program_state, this.particles[i].transformation, this.materials.fire_texture);
                }
            }
        }

      
        if(this.target_transform == null){
            this.target_transform = Mat4.identity();
            this.target_transform = this.target_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                .times(Mat4.translation(10, 0, 50));
        }
        
        this.shapes.target.draw(context, program_state, this.target_transform, this.materials.target);
        
        
        //UI powerbar
        let bar_transform = Mat4.identity();
        let sc = this.pow_multiplier/10-0.1
        bar_transform = bar_transform.times(Mat4.translation(10,0,-5)).times(Mat4.scale(1,sc,1));
        let bar_transform2 = Mat4.inverse(program_state.camera_inverse)
        let ui_t = Mat4.translation(-20,0,-30)
        bar_transform2 = bar_transform2.times(ui_t).times(Mat4.scale(1,sc,1));
        if (sc>8)
            this.shapes.cube.draw(context, program_state, bar_transform2, this.materials.bar_r);
        else if (sc>5)
            this.shapes.cube.draw(context, program_state, bar_transform2, this.materials.bar_y);
        else
            this.shapes.cube.draw(context, program_state, bar_transform2, this.materials.bar_g);
        
        //bar outline
        let out_transform = Mat4.identity().times(Mat4.translation(10,0,-5)).times(Mat4.scale(1,10,1));
        let out_transform2 = Mat4.inverse(program_state.camera_inverse).times(ui_t).times(Mat4.scale(1,10,1));
        this.shapes.outline.draw(context, program_state,out_transform2,this.white,"LINES");
        

        //UI score
        //let score_transform = Mat4.identity().times(Mat4.translation(15,0,12)).times(Mat4.scale(3,3,3));
        let score_transform = Mat4.inverse(program_state.camera_inverse).times(Mat4.translation(20,0,-30)).times(Mat4.rotation(t, 0, 1, 0)).times(Mat4.rotation(0.2*Math.PI, 0, 1, 0));
        switch (this.score) {
          case 1:
            this.shapes.cube.draw(context, program_state, score_transform, this.materials.score1);
            break;
          case 2:
            this.shapes.cube.draw(context, program_state, score_transform, this.materials.score2);
            break;
          case 3:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score3);
            break;
          case 4:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score4);
            break;
          case 5:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score5);
            break;
          case 6:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score6);
            break;
          case 7:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score7);
            break;
          case 8:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score8);
            break;
          case 9:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score9);
            break;
          case 10:
          this.shapes.cube.draw(context, program_state, score_transform, this.materials.score10);
            break;
          default:
            this.shapes.cube.draw(context, program_state, score_transform, this.materials.score0);
        }
        let score_transform2 = Mat4.inverse(program_state.camera_inverse).times(Mat4.translation(20,0,-30)).times(Mat4.rotation(t, 0, 1, 0)).times(Mat4.rotation(0.2*Math.PI, 0, 1, 0));
        this.shapes.axis.draw(context, program_state, score_transform2, this.white);
        // Update each GameObject in the scene then draw it
        for(let i = 0; i < this.gameobjects.length; i++)
        {
            if (i == this.gameobjects.length-1) {
                this.updateGameObject(this.gameobjects[i], this.target_transform, t, dt, true);
                if(this.burning.on == true) {
                    this.burning.transform = this.gameobjects[i].transform.model_transform;
                    program_state.lights.push(new Light(this.gameobjects[i].transform.model_transform.transposed()[3], color(1, 1, 1, 1), 10 ** 10));
                }
            }
            else
                this.updateGameObject(this.gameobjects[i], this.target_transform, t, dt, false);
            
            if ((i == this.gameobjects.length-1 && this.target_moved == false) || i == 0)
                this.gameobjects[i].draw(context, program_state);

        }

        
//1st/3rd person camera movement
        if(typeof this.attached === "function"){
            let desired=Mat4.identity();
            if(this.attached()==3) //third person
                desired=Mat4.translation(10, 0, -80).times(Mat4.rotation(Math.PI,0,1,0)); 
            else if (this.attached()==1){ //first person
                desired = Mat4.inverse(this.archer_fps_cam.model_transform); 

            }
            else{//free camera
                this.cam = "Yes";
            }   
            if(this.attached()!="f"){
                program_state.set_camera(desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)));     
                this.cam = "No";     
            }   
        }
    }
}




